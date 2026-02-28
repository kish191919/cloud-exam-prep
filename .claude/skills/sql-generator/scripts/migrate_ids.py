#!/usr/bin/env python3
"""
migrate_ids.py — 비패딩 question ID를 3자리 zero-padding 형식으로 마이그레이션

비패딩 예: awsdeac01-q2, awsdeac01-q9, awsdeac01-q30
패딩 후:   awsdeac01-q002, awsdeac01-q009, awsdeac01-q030

처리 순서 (FK 제약 우회):
  각 question에 대해:
  1. 새 ID로 questions 레코드 복사 (POST)
  2. 새 question_id로 question_options / question_tags / exam_set_questions 복사 (POST)
  3. 구 자식 레코드 삭제 (DELETE)
  4. 구 questions 레코드 삭제 (DELETE)

사용법:
  python3 migrate_ids.py --exam-id aws-dea-c01 --dry-run  # 미리 보기
  python3 migrate_ids.py --exam-id aws-dea-c01            # 실제 실행
"""

import json
import argparse
import sys
import ssl
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path


def _ssl_context():
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


def load_env(env_path: Path) -> dict:
    env = {}
    if not env_path.exists():
        return env
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, val = line.partition('=')
        env[key.strip()] = val.strip()
    return env


def supabase_get(url: str, key: str, table: str, params: str = '') -> tuple[int, object]:
    endpoint = f"{url}/rest/v1/{table}"
    if params:
        endpoint = f"{endpoint}?{params}"
    req = urllib.request.Request(
        endpoint,
        method='GET',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


def supabase_post(url: str, key: str, table: str, body) -> tuple[int, str]:
    endpoint = f"{url}/rest/v1/{table}"
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=data,
        method='POST',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
    )
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


def supabase_delete(url: str, key: str, table: str, params: str) -> tuple[int, str]:
    endpoint = f"{url}/rest/v1/{table}?{params}"
    req = urllib.request.Request(
        endpoint,
        method='DELETE',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
    )
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


def migrate_one(old_id: str, new_id: str, supabase_url: str, supabase_key: str) -> list[str]:
    """
    question ID 1개를 old_id → new_id로 마이그레이션.
    FK 제약 우회를 위해 새 레코드 복사 후 구 레코드 삭제.
    실패 메시지 목록 반환 (성공 시 빈 리스트).
    """
    errors = []
    enc_old = urllib.parse.quote(old_id, safe='')

    # ── STEP 1: 원본 데이터 조회 ───────────────────────────────────────────────

    status, q_data = supabase_get(
        supabase_url, supabase_key, 'questions',
        f'id=eq.{enc_old}&select=*',
    )
    if status != 200 or not q_data:
        errors.append(f'questions GET 실패: {status} {str(q_data)[:120]}')
        return errors
    q = q_data[0]

    status, opts = supabase_get(
        supabase_url, supabase_key, 'question_options',
        f'question_id=eq.{enc_old}&select=*',
    )
    if status != 200:
        errors.append(f'question_options GET 실패: {status} {str(opts)[:120]}')
        return errors

    status, tags = supabase_get(
        supabase_url, supabase_key, 'question_tags',
        f'question_id=eq.{enc_old}&select=*',
    )
    if status != 200:
        errors.append(f'question_tags GET 실패: {status} {str(tags)[:120]}')
        return errors

    status, sets = supabase_get(
        supabase_url, supabase_key, 'exam_set_questions',
        f'question_id=eq.{enc_old}&select=*',
    )
    if status != 200:
        errors.append(f'exam_set_questions GET 실패: {status} {str(sets)[:120]}')
        return errors

    # ── STEP 2: 새 ID로 questions 복사 ────────────────────────────────────────

    new_q = {k: v for k, v in q.items() if k != 'id'}
    new_q['id'] = new_id

    status, body = supabase_post(supabase_url, supabase_key, 'questions', new_q)
    if status not in (200, 201):
        errors.append(f'questions POST 실패: {status} {str(body)[:120]}')
        return errors

    # ── STEP 3: 자식 테이블 복사 (new question_id) ────────────────────────────

    # question_options — 각 행의 UUID id는 제외하고 복사 (새 UUID 자동 생성)
    if opts:
        new_opts = [{k: v for k, v in o.items() if k != 'id'} | {'question_id': new_id} for o in opts]
        status, body = supabase_post(supabase_url, supabase_key, 'question_options', new_opts)
        if status not in (200, 201):
            errors.append(f'question_options POST 실패: {status} {str(body)[:120]}')

    # question_tags — 각 행의 UUID id는 제외하고 복사
    if tags:
        new_tags = [{k: v for k, v in t.items() if k != 'id'} | {'question_id': new_id} for t in tags]
        status, body = supabase_post(supabase_url, supabase_key, 'question_tags', new_tags)
        if status not in (200, 201):
            errors.append(f'question_tags POST 실패: {status} {str(body)[:120]}')

    # exam_set_questions — UUID id는 제외하고 복사
    if sets:
        new_sets = [{k: v for k, v in s.items() if k != 'id'} | {'question_id': new_id} for s in sets]
        status, body = supabase_post(supabase_url, supabase_key, 'exam_set_questions', new_sets)
        if status not in (200, 201):
            errors.append(f'exam_set_questions POST 실패: {status} {str(body)[:120]}')

    # 여기까지 POST에서 에러가 있으면 삭제 단계 진행 안 함
    if errors:
        return errors

    # ── STEP 4: 구 자식 레코드 삭제 ───────────────────────────────────────────

    for table in ('question_options', 'question_tags', 'exam_set_questions'):
        status, body = supabase_delete(
            supabase_url, supabase_key, table,
            f'question_id=eq.{enc_old}',
        )
        if status not in (200, 204):
            errors.append(f'{table} DELETE 실패: {status} {str(body)[:120]}')

    if errors:
        return errors

    # ── STEP 5: 구 questions 레코드 삭제 ─────────────────────────────────────

    status, body = supabase_delete(
        supabase_url, supabase_key, 'questions',
        f'id=eq.{enc_old}',
    )
    if status not in (200, 204):
        errors.append(f'questions DELETE 실패: {status} {str(body)[:120]}')

    return errors


def main():
    parser = argparse.ArgumentParser(description='question ID 마이그레이션 (zero-padding 또는 접두사 수정)')
    parser.add_argument('--exam-id', required=True, help='exam_id (예: aws-dea-c01)')
    parser.add_argument('--dry-run', action='store_true', help='변경 내용만 출력, 실제 변경 없음')
    parser.add_argument('--fix-prefix', action='store_true', help='접두사 불일치 ID를 올바른 접두사로 수정')
    args = parser.parse_args()

    # .env 읽기
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parents[3]
    env = load_env(project_root / '.env')

    supabase_url = (env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env에서 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.')
        sys.exit(1)

    # 전체 ID 조회
    enc_exam = urllib.parse.quote(args.exam_id, safe='')
    status, data = supabase_get(
        supabase_url, supabase_key,
        'questions',
        f'select=id&exam_id=eq.{enc_exam}',
    )
    if status != 200:
        print(f'[ERROR] ID 조회 실패: {status} {data}')
        sys.exit(1)

    all_ids = [d['id'] for d in data]

    if args.fix_prefix:
        # ── 접두사 수정 모드 ───────────────────────────────────────────────────
        correct_prefix = args.exam_id.replace('-', '')
        migrations = []
        for qid in all_ids:
            if '-q' not in qid:
                continue
            prefix = qid.split('-q')[0]
            if prefix != correct_prefix:
                suffix = qid.split('-q')[1]
                new_id = f"{correct_prefix}-q{suffix}"
                migrations.append((qid, new_id))

        if not migrations:
            print(f'[완료] 접두사 불일치 ID 없음 — 올바른 접두사: {correct_prefix}')
            return

        # 숫자 순 정렬
        migrations.sort(key=lambda x: int(x[0].split('-q')[1]))

        if args.dry_run:
            print(f'[DRY-RUN] {args.exam_id} 접두사 불일치 ID {len(migrations)}개 (올바른 접두사: {correct_prefix}):')
            for old_id, new_id in migrations:
                print(f'  {old_id} → {new_id}')
            print(f'\n총 {len(migrations)}개 ID 변경 예정')
            print('처리 순서: questions 복사 → 자식 테이블 복사 → 구 자식 삭제 → 구 questions 삭제')
            return

        success, failed = [], []
        for old_id, new_id in migrations:
            errors = migrate_one(old_id, new_id, supabase_url, supabase_key)
            if errors:
                for err in errors:
                    print(f'[FAIL] {old_id} → {new_id}: {err}')
                failed.append(old_id)
            else:
                print(f'[OK] {old_id} → {new_id}')
                success.append(old_id)

        print(f'\n[완료] 성공: {len(success)}개 | 실패: {len(failed)}개')
        if failed:
            print(f'실패 목록: {failed}')
            sys.exit(1)
        return

    # ── 비패딩 ID 수정 모드 (기본) ────────────────────────────────────────────

    # 비패딩 ID 필터링: 숫자 접미사 길이 < 3
    migrations = []
    for old_id in all_ids:
        parts = old_id.split('-q')
        if len(parts) != 2:
            continue
        prefix, suffix = parts[0], parts[1]
        if not suffix.isdigit():
            continue
        if len(suffix) < 3:
            num = int(suffix)
            new_id = f"{prefix}-q{num:03d}"
            migrations.append((old_id, new_id))

    if not migrations:
        print(f'[완료] 비패딩 ID 없음 — 마이그레이션 불필요')
        return

    # 숫자 순 정렬
    migrations.sort(key=lambda x: int(x[0].split('-q')[1]))

    if args.dry_run:
        print(f'[DRY-RUN] {args.exam_id} 비패딩 ID {len(migrations)}개:')
        for old_id, new_id in migrations:
            print(f'  {old_id} → {new_id}')
        print(f'\n총 {len(migrations)}개 ID 변경 예정')
        print('처리 순서: questions 복사 → 자식 테이블 복사 → 구 자식 삭제 → 구 questions 삭제')
        return

    # 실제 마이그레이션
    success, failed = [], []
    for old_id, new_id in migrations:
        errors = migrate_one(old_id, new_id, supabase_url, supabase_key)
        if errors:
            for err in errors:
                print(f'[FAIL] {old_id} → {new_id}: {err}')
            failed.append(old_id)
        else:
            print(f'[OK] {old_id} → {new_id}')
            success.append(old_id)

    print(f'\n[완료] 성공: {len(success)}개 | 실패: {len(failed)}개')
    if failed:
        print(f'실패 목록: {failed}')
        sys.exit(1)


if __name__ == '__main__':
    main()
