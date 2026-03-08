#!/usr/bin/env python3
"""
export_questions_text.py — Supabase에서 질문 텍스트만 추출하여 txt 저장

사용법:
  python3 export_questions_text.py [--exam-id aws-aif-c01] [--output output/aif_c01_questions.txt]
"""

import json
import argparse
import ssl
import sys
import urllib.request
import urllib.error
from pathlib import Path


def _ssl_context():
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


def load_env(env_path):
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


def supabase_get(url, key, params):
    endpoint = f"{url}/rest/v1/questions?{params}"
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


def fetch_all_questions(supabase_url, supabase_key, exam_id):
    """페이지네이션으로 전체 조회"""
    all_questions = []
    page_size = 1000
    offset = 0

    while True:
        params = (
            f"select=id,text"
            f"&exam_id=eq.{exam_id}"
            f"&limit={page_size}"
            f"&offset={offset}"
        )
        status, data = supabase_get(supabase_url, supabase_key, params)
        if status != 200:
            print(f"[오류] Supabase 조회 실패 (HTTP {status}): {data}")
            sys.exit(1)
        if not data:
            break
        all_questions.extend(data)
        if len(data) < page_size:
            break
        offset += page_size

    return all_questions


def sort_by_number(questions):
    """q 접미사 숫자 기준 정렬"""
    def extract_num(q):
        qid = q['id']
        suffix = qid.split('-q')[-1]
        try:
            return int(suffix)
        except ValueError:
            return 0
    return sorted(questions, key=extract_num)


def main():
    parser = argparse.ArgumentParser(description='Supabase 질문 텍스트 내보내기')
    parser.add_argument('--exam-id', default='aws-aif-c01', help='시험 ID (기본값: aws-aif-c01)')
    parser.add_argument('--output', default=None, help='출력 파일 경로 (기본값: output/{exam_code}_questions.txt)')
    args = parser.parse_args()

    # 프로젝트 루트 기준으로 .env 로드
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parents[3]  # scripts → sql-generator → skills → .claude → project_root
    env_path = project_root / '.env'

    env = load_env(env_path)
    supabase_url = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        print("[오류] .env 파일에서 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.")
        sys.exit(1)

    exam_id = args.exam_id
    exam_code = exam_id.replace('-', '')

    if args.output:
        output_path = Path(args.output)
    else:
        output_dir = project_root / 'output'
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / f"{exam_code}_questions.txt"

    print(f"[조회] exam_id={exam_id} 질문 전체 조회 중...")
    questions = fetch_all_questions(supabase_url, supabase_key, exam_id)
    print(f"[완료] {len(questions)}개 문제 조회됨")

    questions = sort_by_number(questions)

    lines = []
    for q in questions:
        lines.append(f"[{q['id']}]")
        lines.append(q['text'] or '')
        lines.append('')

    output_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f"[저장] {output_path} ({len(questions)}개 문제)")


if __name__ == '__main__':
    main()
