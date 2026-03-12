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
import re
import sys
import ssl
import urllib.request
import urllib.error
from pathlib import Path


def normalize_text_linebreaks(text: str) -> str:
    """
    Rule 3 결정론적 후처리 — text_* 5개 필드에 적용 (5개 언어 공통).
    1. 이미 올바른 \\n\\n 서식이면 단락 내부 공백만 정리 후 반환 (한국어 등 대응)
    2. 기존 \\n / \\n\\n 을 공백으로 평탄화
    3. 문장 경계(. ! ? 。 ？ + 공백)로 분리
    4. ? 가 없으면 평탄화 그대로 반환
    5. 마지막 ? 문장 앞에 항상 \\n\\n 삽입
    6. 전체 문장 수 >= 4이면 첫 번째 문장 뒤에도 \\n\\n 삽입
    """
    if not text or not isinstance(text, str):
        return text

    # 이미 올바른 \n\n 서식 (한국어 등 마침표 없는 언어 대응)
    # \n\n 뒤 마지막 단락에 ?가 있으면 구조 보존, 단락 내부 공백만 정리
    if '\n\n' in text:
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        if paragraphs and ('?' in paragraphs[-1] or '？' in paragraphs[-1]):
            cleaned = [re.sub(r'\s*\n\s*', ' ', p) for p in paragraphs]
            cleaned = [re.sub(r'  +', ' ', p) for p in cleaned]
            return '\n\n'.join(cleaned).lstrip('\n ').rstrip()

    # 평탄화
    flat = re.sub(r'\n+', ' ', text).strip()
    flat = re.sub(r'  +', ' ', flat)

    # ? 없으면 변환 불필요
    if '?' not in flat and '？' not in flat:
        return flat

    # 문장 분리
    parts = re.split(r'(?<=[.!?。？])\s+', flat.strip())
    parts = [p.strip() for p in parts if p.strip()]

    if len(parts) <= 1:
        return flat

    # 마지막 ? 문장 찾기 (뒤에서부터)
    last_idx = None
    for i in range(len(parts) - 1, -1, -1):
        if '?' in parts[i] or '？' in parts[i]:
            last_idx = i
            break
    if last_idx is None or last_idx == 0:
        return flat

    last_sentence = parts[last_idx]
    body_parts = parts[:last_idx]

    # Rule 3 적용
    if len(parts) >= 4:
        first = body_parts[0]
        middle = ' '.join(body_parts[1:])
        result = first + '\n\n' + middle + '\n\n' + last_sentence
    else:
        result = ' '.join(body_parts) + '\n\n' + last_sentence

    return result.lstrip('\n ').rstrip()


def _ssl_context() -> ssl.SSLContext:
    """macOS Python 환경에서 시스템 CA 번들을 우선 사용하는 SSL 컨텍스트."""
    ctx = ssl.create_default_context()
    # macOS 시스템 CA 번들 경로 시도
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


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

def supabase_get(url: str, key: str, table: str, params: str) -> tuple[int, list]:
    """GET {url}/rest/v1/{table}?{params} — 존재 확인용."""
    endpoint = f"{url}/rest/v1/{table}?{params}"
    req = urllib.request.Request(
        endpoint,
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
        return e.code, []


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
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
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

    # 중복 삽입 방지: questions 테이블에 이미 같은 ID가 있으면 SKIP
    _, existing = supabase_get(supabase_url, supabase_key, 'questions', f'id=eq.{qid}&select=id')
    if existing:
        print(f'[SKIP] {qid} — 이미 존재합니다 (중복 삽입 방지)')
        return []

    # correct_option_id / option_id 정규화: 숫자("1"~"4") → 알파벳("a"~"d")
    _num_to_letter = {"1": "a", "2": "b", "3": "c", "4": "d"}
    raw_correct = q.get('correct_option_id', '')
    if raw_correct in _num_to_letter:
        print(f'[WARN] {qid} correct_option_id 숫자 형식 감지: "{raw_correct}" → "{_num_to_letter[raw_correct]}" 자동 변환')
        q = dict(q)
        q['correct_option_id'] = _num_to_letter[raw_correct]
    for opt in q.get('options', []):
        if opt.get('option_id') in _num_to_letter:
            opt['option_id'] = _num_to_letter[opt['option_id']]

    # Rule 3 post-processing: text_* 필드 줄바꿈 서식 결정론적 적용
    q = dict(q)
    for _field in ('text', 'text_en', 'text_pt', 'text_es'):
        _val = q.get(_field)
        if _val and isinstance(_val, str):
            q[_field] = normalize_text_linebreaks(_val)

    # 1. questions
    ref_links_raw = q.get('ref_links', [])
    if isinstance(ref_links_raw, str):
        try:
            ref_links_val = json.loads(ref_links_raw)
        except (json.JSONDecodeError, ValueError):
            ref_links_val = []
    else:
        ref_links_val = ref_links_raw if ref_links_raw is not None else []
    question_body = {
        'id': qid,
        'exam_id': q['exam_id'],
        'text': q['text'],
        'text_en': q.get('text_en') or None,
        'text_pt': q.get('text_pt') or None,
        'text_es': q.get('text_es') or None,
        'correct_option_id': q['correct_option_id'],
        'explanation': q['explanation'],
        'explanation_en': q.get('explanation_en') or None,
        'explanation_pt': q.get('explanation_pt') or None,
        'explanation_es': q.get('explanation_es') or None,
        'key_points': q.get('key_points') or '',
        'key_points_en': q.get('key_points_en') or None,
        'key_points_pt': q.get('key_points_pt') or None,
        'key_points_es': q.get('key_points_es') or None,
        'ref_links': ref_links_val,
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
            'text_pt': opt.get('text_pt') or None,
            'text_es': opt.get('text_es') or None,
            'explanation': opt.get('explanation') or '',
            'explanation_en': opt.get('explanation_en') or None,
            'explanation_pt': opt.get('explanation_pt') or None,
            'explanation_es': opt.get('explanation_es') or None,
            'sort_order': int(opt['sort_order']),
        })
    if options_body:
        status, body = supabase_post(supabase_url, supabase_key, 'question_options', options_body)
        if status not in (200, 201):
            errors.append(f'question_options INSERT 실패: {status} {body[:200]}')

    # 3. question_tags
    tag = q.get('tag') or ''
    if tag:
        tag_body = {
            'question_id': qid,
            'tag': tag,
            'tag_en': q.get('tag_en') or None,
            'tag_pt': q.get('tag_pt') or None,
            'tag_es': q.get('tag_es') or None,
        }
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
    parser.add_argument('--input-file', default=None,
                        help='재설계된 문제 JSON 파일 (기본: output/redesigned_questions.json)')
    parser.add_argument('--questions-json', default=None,
                        help='문제 JSON 문자열 직접 입력 (--input-file 대안, 파일 없이 삽입 가능)')
    parser.add_argument('--set-id', required=True,
                        help='exam_sets UUID (Supabase)')
    parser.add_argument('--sort-order-start', type=int, default=1,
                        help='exam_set_questions.sort_order 시작값 (기본: 1)')
    args = parser.parse_args()

    # .env 읽기 (스크립트 위치 기준 프로젝트 루트 탐색)
    script_dir = Path(__file__).resolve().parent
    # 프로젝트 루트 = 스크립트에서 4단계 상위 (.claude/skills/sql-generator/scripts/ → .claude/ → root)
    project_root = script_dir.parents[3]
    env = load_env(project_root / '.env')

    supabase_url = env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or ''
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env 파일에서 SUPABASE_URL(또는 VITE_SUPABASE_URL)과 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.')
        sys.exit(1)

    supabase_url = supabase_url.rstrip('/')

    # 입력 소스 결정: --questions-json > --input-file > 기본 파일
    if args.questions_json:
        try:
            questions = json.loads(args.questions_json)
        except json.JSONDecodeError as e:
            print(f'[ERROR] --questions-json 파싱 실패: {e}')
            sys.exit(1)
    else:
        input_file = args.input_file or 'output/redesigned_questions.json'
        input_path = Path(input_file)
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
