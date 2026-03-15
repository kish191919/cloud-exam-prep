#!/usr/bin/env python3
"""
find_duplicates.py — Supabase에서 aws-clf-c02 문제를 가져와 유사/중복 탐지

사용법:
  python3 find_duplicates.py [--exam-id aws-clf-c02] [--threshold 0.65]

출력:
  output/clf_c02_duplicates.json
  output/clf_c02_duplicates_report.txt
"""

import json
import re
import ssl
import sys
import argparse
import urllib.request
import urllib.error
from difflib import SequenceMatcher
from itertools import combinations
from pathlib import Path
import os


def load_env_file(path: Path) -> dict:
    """간단한 .env 파일 파서 (python-dotenv 불필요)"""
    env = {}
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, val = line.partition('=')
                env[key.strip()] = val.strip().strip('"').strip("'")
    except Exception:
        pass
    return env


# .env 탐색: 스크립트 위치에서 상위로 이동하며 찾기
_script_dir = Path(__file__).resolve().parent
_env: dict = {}
for _p in [_script_dir] + list(_script_dir.parents):
    _candidate = _p / '.env'
    if _candidate.exists():
        _env = load_env_file(_candidate)
        break

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL') or _env.get('VITE_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or _env.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('[ERROR] VITE_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.')
    print('  .env 파일을 확인하거나 환경변수를 직접 설정하세요.')
    sys.exit(1)

def _ssl_context() -> ssl.SSLContext:
    """macOS Python 환경에서 시스템 CA 번들을 우선 사용하는 SSL 컨텍스트."""
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


def supabase_get(table: str, params: str) -> list:
    """Supabase REST API GET 요청 (페이지네이션 포함)"""
    results = []
    limit = 1000
    offset = 0
    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?{params}&limit={limit}&offset={offset}"
        req = urllib.request.Request(url, headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
        })
        try:
            with urllib.request.urlopen(req, context=_ssl_context()) as resp:
                data = json.loads(resp.read().decode())
                results.extend(data)
                if len(data) < limit:
                    break
                offset += limit
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f'[HTTP ERROR] {e.code}: {body}')
            sys.exit(1)
    return results


def normalize(text: str) -> str:
    """유사도 비교를 위한 텍스트 정규화"""
    if not text:
        return ''
    # 줄바꿈 → 공백
    text = re.sub(r'\s+', ' ', text)
    # 특수문자 제거 (한글·영문·숫자·공백 유지)
    text = re.sub(r'[^\w\s가-힣]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text


def jaccard_similarity(a: str, b: str) -> float:
    """어절(공백 분리) 기반 Jaccard 유사도"""
    set_a = set(a.split())
    set_b = set(b.split())
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def seq_similarity(a: str, b: str) -> float:
    """SequenceMatcher 기반 문자열 유사도"""
    return SequenceMatcher(None, a, b).ratio()


def similarity(a: str, b: str) -> float:
    """Jaccard + SequenceMatcher 평균"""
    j = jaccard_similarity(a, b)
    s = seq_similarity(a, b)
    return (j + s) / 2


def main():
    parser = argparse.ArgumentParser(description='Supabase 문제 중복/유사 탐지')
    parser.add_argument('--exam-id', default='aws-clf-c02', help='시험 ID (기본: aws-clf-c02)')
    parser.add_argument('--threshold', type=float, default=0.65,
                        help='유사도 임계값 (기본: 0.65)')
    args = parser.parse_args()

    exam_id = args.exam_id
    threshold = args.threshold

    print(f'[1/4] {exam_id} 문제 조회 중...')
    questions = supabase_get('questions', f'exam_id=eq.{exam_id}&select=id,text,correct_option_id')
    print(f'      → {len(questions)}개 조회 완료')

    if len(questions) < 2:
        print('[INFO] 비교할 문제가 부족합니다.')
        sys.exit(0)

    # 정규화
    print('[2/4] 텍스트 정규화 중...')
    for q in questions:
        q['_norm'] = normalize(q.get('text') or '')

    # pairwise 비교
    print(f'[3/4] 유사도 계산 중 (임계값: {threshold})...')
    n = len(questions)
    total_pairs = n * (n - 1) // 2
    print(f'      총 {total_pairs:,}쌍 비교')

    similar_pairs = []
    for i, (q1, q2) in enumerate(combinations(questions, 2)):
        if not q1['_norm'] or not q2['_norm']:
            continue
        # 1차: Jaccard 빠른 필터 (threshold - 0.15)
        j = jaccard_similarity(q1['_norm'], q2['_norm'])
        if j < max(0.0, threshold - 0.15):
            continue
        # 2차: 정밀 계산
        score = similarity(q1['_norm'], q2['_norm'])
        if score >= threshold:
            similar_pairs.append({
                'id1': q1['id'],
                'id2': q2['id'],
                'score': round(score, 4),
                'text1': q1.get('text', ''),
                'text2': q2.get('text', ''),
                'correct1': q1.get('correct_option_id', ''),
                'correct2': q2.get('correct_option_id', ''),
            })
        if (i + 1) % 50000 == 0:
            print(f'      진행: {i+1:,}/{total_pairs:,} ({(i+1)/total_pairs*100:.1f}%)')

    # 유사도 내림차순 정렬
    similar_pairs.sort(key=lambda x: x['score'], reverse=True)

    # 중복/유사 분류
    exact = [p for p in similar_pairs if p['score'] >= 0.85]
    similar = [p for p in similar_pairs if threshold <= p['score'] < 0.85]

    print(f'      → 거의 동일(≥0.85): {len(exact)}쌍 | 유사(≥{threshold}): {len(similar)}쌍')

    # 출력 디렉터리
    output_dir = Path(__file__).resolve()
    # 프로젝트 루트/output 탐색
    for _ in range(10):
        output_dir = output_dir.parent
        candidate = output_dir / 'output'
        if candidate.is_dir():
            output_dir = candidate
            break
    else:
        output_dir = Path.cwd() / 'output'
        output_dir.mkdir(exist_ok=True)

    exam_code = exam_id.replace('-', '_')

    # JSON 저장
    print('[4/4] 결과 저장 중...')
    json_path = output_dir / f'{exam_code}_duplicates.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump({
            'exam_id': exam_id,
            'total_questions': len(questions),
            'threshold': threshold,
            'exact_duplicates': exact,
            'similar_pairs': similar,
        }, f, ensure_ascii=False, indent=2)
    print(f'      → {json_path}')

    # 텍스트 보고서 저장
    report_path = output_dir / f'{exam_code}_duplicates_report.txt'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f'{'='*70}\n')
        f.write(f'  {exam_id} 중복/유사 문제 탐지 보고서\n')
        f.write(f'  총 {len(questions)}개 문제 | 임계값: {threshold}\n')
        f.write(f'{'='*70}\n\n')

        f.write(f'■ 거의 동일 (유사도 ≥ 0.85): {len(exact)}쌍\n')
        f.write(f'■ 유사 (유사도 {threshold}~0.85): {len(similar)}쌍\n\n')

        if exact:
            f.write(f'{'─'*70}\n')
            f.write('【거의 동일 (중복 의심)】\n')
            f.write(f'{'─'*70}\n\n')
            for p in exact:
                f.write(f'[{p["id1"]}] vs [{p["id2"]}]  유사도: {p["score"]:.4f}')
                if p['correct1'] == p['correct2']:
                    f.write(f'  정답: 동일({p["correct1"]})\n')
                else:
                    f.write(f'  정답: {p["correct1"]} vs {p["correct2"]}\n')
                f.write(f'  ① {p["text1"][:200]}\n')
                f.write(f'  ② {p["text2"][:200]}\n\n')

        if similar:
            f.write(f'{'─'*70}\n')
            f.write(f'【유사 (검토 필요)】\n')
            f.write(f'{'─'*70}\n\n')
            for p in similar:
                f.write(f'[{p["id1"]}] vs [{p["id2"]}]  유사도: {p["score"]:.4f}')
                if p['correct1'] == p['correct2']:
                    f.write(f'  정답: 동일({p["correct1"]})\n')
                else:
                    f.write(f'  정답: {p["correct1"]} vs {p["correct2"]}\n')
                f.write(f'  ① {p["text1"][:200]}\n')
                f.write(f'  ② {p["text2"][:200]}\n\n')

    print(f'      → {report_path}')
    print()
    print('완료!')
    print(f'  거의 동일(중복 의심): {len(exact)}쌍')
    print(f'  유사(검토 필요):      {len(similar)}쌍')


if __name__ == '__main__':
    main()
