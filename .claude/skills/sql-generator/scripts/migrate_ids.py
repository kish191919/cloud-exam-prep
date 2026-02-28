#!/usr/bin/env python3
"""
migrate_ids.py — 비패딩 question ID를 3자리 zero-padding 형식으로 마이그레이션

비패딩 예: awsdeac01-q2, awsdeac01-q9, awsdeac01-q30
패딩 후:   awsdeac01-q002, awsdeac01-q009, awsdeac01-q030

영향받는 테이블: questions(PK), question_options(FK), question_tags(FK), exam_set_questions(FK)

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


def supabase_patch(url: str, key: str, table: str, params: str, body: dict) -> tuple[int, str]:
    endpoint = f"{url}/rest/v1/{table}?{params}"
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=data,
        method='PATCH',
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
    """ID 1개를 4개 테이블에서 old → new로 변경. 실패 메시지 목록 반환."""
    errors = []
    enc_old = urllib.parse.quote(old_id, safe='')

    # 1. FK 자식 테이블 먼저 (question_id 컬럼)
    for table in ('question_options', 'question_tags', 'exam_set_questions'):
        status, body = supabase_patch(
            supabase_url, supabase_key,
            table,
            f'question_id=eq.{enc_old}',
            {'question_id': new_id},
        )
        if status not in (200, 204):
            errors.append(f'{table} PATCH 실패: {status} {str(body)[:120]}')

    # 2. PK 마지막
    status, body = supabase_patch(
        supabase_url, supabase_key,
        'questions',
        f'id=eq.{enc_old}',
        {'id': new_id},
    )
    if status not in (200, 204):
        errors.append(f'questions PK PATCH 실패: {status} {str(body)[:120]}')

    return errors


def main():
    parser = argparse.ArgumentParser(description='비패딩 question ID → 3자리 zero-padding 마이그레이션')
    parser.add_argument('--exam-id', required=True, help='exam_id (예: aws-dea-c01)')
    parser.add_argument('--dry-run', action='store_true', help='변경 내용만 출력, 실제 변경 없음')
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
        print(f'\n총 {len(migrations)}개 ID 변경 예정 (4개 테이블 각각)')
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
