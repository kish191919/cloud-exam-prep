#!/usr/bin/env python3
"""
insert_supabase.py — redesigned_questions.json → Supabase REST API 직접 삽입

입력: output/redesigned_questions.json
출력: Supabase questions / question_options / question_tags / exam_set_questions INSERT

사용법:
  python3 insert_supabase.py \
    --input-file output/redesigned_questions.json \
    --set-id 550e8400-e29b-41d4-a716-446655440001 \
    --sort-order-start 1
"""

import json
import argparse
import sys
import urllib.request
import urllib.error
from pathlib import Path


# ── .env 파싱 ─────────────────────────────────────────────────────────────────

def load_env(env_path: Path) -> dict:
    """프로젝트 루트의 .env 파일에서 키-값 읽기."""
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


# ── Supabase REST API 호출 ────────────────────────────────────────────────────

def supabase_post(url: str, key: str, table: str, body) -> tuple[int, str]:
    """
    POST {url}/rest/v1/{table}
    body: dict 또는 list
    반환: (status_code, response_text)
    """
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
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


# ── 단일 문제 삽입 ────────────────────────────────────────────────────────────

def insert_question(q: dict, set_id: str, sort_order: int, supabase_url: str, supabase_key: str) -> list[str]:
    """
    문제 1개를 4개 테이블에 순서대로 삽입.
    실패한 테이블 이름 목록 반환 (성공 시 빈 리스트).
    """
    qid = q['id']
    errors = []

    # 1. questions
    question_body = {
        'id': qid,
        'exam_id': q['exam_id'],
        'text': q['text'],
        'text_en': q.get('text_en') or None,
        'correct_option_id': q['correct_option_id'],
        'explanation': q['explanation'],
        'explanation_en': q.get('explanation_en') or None,
        'key_points': q.get('key_points') or '',
        'key_points_en': q.get('key_points_en') or None,
        'ref_links': q.get('ref_links', []),
    }
    status, body = supabase_post(supabase_url, supabase_key, 'questions', question_body)
    if status not in (200, 201):
        errors.append(f'questions INSERT 실패: {status} {body[:200]}')
        return errors  # questions 실패 시 이하 테이블 삽입 중단

    # 2. question_options (배열 bulk insert)
    options_body = []
    for opt in q.get('options', []):
        options_body.append({
            'question_id': qid,
            'option_id': opt['option_id'],
            'text': opt['text'],
            'text_en': opt.get('text_en') or None,
            'explanation': opt.get('explanation') or '',
            'explanation_en': opt.get('explanation_en') or None,
            'sort_order': int(opt['sort_order']),
        })
    if options_body:
        status, body = supabase_post(supabase_url, supabase_key, 'question_options', options_body)
        if status not in (200, 201):
            errors.append(f'question_options INSERT 실패: {status} {body[:200]}')

    # 3. question_tags
    tag = q.get('tag') or ''
    if tag:
        tag_body = {'question_id': qid, 'tag': tag}
        status, body = supabase_post(supabase_url, supabase_key, 'question_tags', tag_body)
        if status not in (200, 201):
            errors.append(f'question_tags INSERT 실패: {status} {body[:200]}')

    # 4. exam_set_questions
    set_body = {'set_id': set_id, 'question_id': qid, 'sort_order': sort_order}
    status, body = supabase_post(supabase_url, supabase_key, 'exam_set_questions', set_body)
    if status not in (200, 201):
        errors.append(f'exam_set_questions INSERT 실패: {status} {body[:200]}')

    return errors


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Supabase REST API 직접 삽입')
    parser.add_argument('--input-file', default='output/redesigned_questions.json',
                        help='재설계된 문제 JSON 파일 (기본: output/redesigned_questions.json)')
    parser.add_argument('--set-id', required=True,
                        help='exam_sets UUID (Supabase)')
    parser.add_argument('--sort-order-start', type=int, default=1,
                        help='exam_set_questions.sort_order 시작값 (기본: 1)')
    args = parser.parse_args()

    # .env 읽기 (스크립트 위치 기준 프로젝트 루트 탐색)
    script_dir = Path(__file__).resolve().parent
    # 프로젝트 루트 = 스크립트에서 5단계 상위 (.claude/skills/sql-generator/scripts/ → .claude/ → root)
    project_root = script_dir.parents[4]
    env = load_env(project_root / '.env')

    supabase_url = env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or ''
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env 파일에서 SUPABASE_URL(또는 VITE_SUPABASE_URL)과 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.')
        sys.exit(1)

    supabase_url = supabase_url.rstrip('/')

    # 입력 파일 읽기
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f'[ERROR] 입력 파일 없음: {input_path}')
        sys.exit(1)

    questions = json.loads(input_path.read_text(encoding='utf-8'))
    if not questions:
        print('[ERROR] 재설계된 문제가 없습니다.')
        sys.exit(1)

    # 삽입 실행
    success_ids = []
    failed_ids = []
    sort_order = args.sort_order_start

    for q in questions:
        qid = q.get('id', '?')
        errors = insert_question(q, args.set_id, sort_order, supabase_url, supabase_key)
        if errors:
            for err in errors:
                print(f'[FAIL] {qid} — {err}')
            failed_ids.append(qid)
        else:
            print(f'[OK] {qid} 삽입 완료')
            success_ids.append(qid)
        sort_order += 1

    # 결과 요약
    print(f'\n[완료] 성공: {len(success_ids)}개 | 실패: {len(failed_ids)}개', end='')
    if failed_ids:
        print(f' → {failed_ids}')
    else:
        print()

    id_list = [q.get('id', '') for q in questions]
    first_id = id_list[0] if id_list else 'N/A'
    last_id = id_list[-1] if id_list else 'N/A'
    print(f'[완료] ID 범위: {first_id} ~ {last_id}')

    if failed_ids:
        sys.exit(1)


if __name__ == '__main__':
    main()
