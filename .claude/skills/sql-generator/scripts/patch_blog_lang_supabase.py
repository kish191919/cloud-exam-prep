#!/usr/bin/env python3
"""
patch_blog_lang_supabase.py — blog_posts 다국어 번역 백필 도구 (JA / ES / PT)

모드 1 (--fetch): title_ja / title_es / title_pt 등이 누락된 게시 포스트 조회
                   → output/needs_blog_translation.json 저장
모드 2 (--patch): 번역 완료된 JSON을 Supabase REST API PATCH로 반영
                   → --input-file output/translated_blog_posts.json

사용법:
  python3 patch_blog_lang_supabase.py --fetch
  python3 patch_blog_lang_supabase.py --fetch --exam-id aws-aif-c01
  python3 patch_blog_lang_supabase.py --patch --input-file output/translated_blog_posts.json
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


def supabase_get(url, key, table, params=''):
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


def supabase_patch(url, key, table, params, body):
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


def fetch_needs_translation(supabase_url, supabase_key, exam_id=None):
    """미번역 blog_posts 조회 → output/needs_blog_translation.json 저장"""
    print('[FETCH] 미번역 blog_posts 조회 중...')

    # 페이지네이션으로 전체 조회 (Supabase REST 기본 한도 1000)
    all_posts = []
    offset = 0
    page_size = 1000
    while True:
        params_parts = [
            'is_published=eq.true',
            'select=id,slug,title,excerpt,content,title_en,excerpt_en,content_en,title_ja,title_es,title_pt',
            f'offset={offset}',
            f'limit={page_size}',
        ]
        if exam_id:
            params_parts.append(f'exam_id=eq.{urllib.parse.quote(exam_id, safe="")}')

        status, data = supabase_get(supabase_url, supabase_key, 'blog_posts', '&'.join(params_parts))
        if status != 200:
            print(f'[ERROR] blog_posts 조회 실패 (HTTP {status}): {data}')
            sys.exit(1)
        if not data:
            break
        all_posts.extend(data)
        if len(data) < page_size:
            break
        offset += page_size

    print(f'[FETCH] 총 게시 포스트: {len(all_posts)}개')

    # 미번역 필터 (title_ja / title_es / title_pt 중 하나라도 누락)
    needs = []
    for post in all_posts:
        missing_langs = []
        if not post.get('title_ja'):
            missing_langs.append('ja')
        if not post.get('title_es'):
            missing_langs.append('es')
        if not post.get('title_pt'):
            missing_langs.append('pt')

        if missing_langs:
            needs.append({
                'id':          post['id'],
                'slug':        post['slug'],
                'title':       post['title'],
                'excerpt':     post.get('excerpt') or '',
                'content':     post.get('content') or '',
                'title_en':    post.get('title_en') or '',
                'excerpt_en':  post.get('excerpt_en') or '',
                'content_en':  post.get('content_en') or '',
                'missing_langs': missing_langs,
            })

    output_path = Path('output/needs_blog_translation.json')
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json.dumps(needs, ensure_ascii=False, indent=2), encoding='utf-8')

    ja_count = sum(1 for p in needs if 'ja' in p['missing_langs'])
    es_count = sum(1 for p in needs if 'es' in p['missing_langs'])
    pt_count = sum(1 for p in needs if 'pt' in p['missing_langs'])

    print(f'\n[결과] 미번역 포스트: {len(needs)}개')
    print(f'  - title_ja 누락: {ja_count}개')
    print(f'  - title_es 누락: {es_count}개')
    print(f'  - title_pt 누락: {pt_count}개')
    print(f'저장: {output_path}')
    return len(needs)


def patch_translations(supabase_url, supabase_key, input_file):
    """번역 완료 JSON을 읽어 blog_posts에 PATCH"""
    input_path = Path(input_file)
    if not input_path.exists():
        print(f'[ERROR] 입력 파일을 찾을 수 없습니다: {input_file}')
        sys.exit(1)

    results = json.loads(input_path.read_text(encoding='utf-8'))
    if not isinstance(results, list):
        # { "results": [...] } 형태도 허용
        results = results.get('results', [])

    print(f'[PATCH] 총 {len(results)}개 포스트 PATCH 시작...')

    success = 0
    failed = 0

    for item in results:
        post_id = item.get('id')
        if not post_id:
            print('[WARN] id 없는 항목 스킵')
            failed += 1
            continue

        # 번역된 필드만 payload에 포함 (null/빈 값 제외)
        payload = {}
        for field in ('title_ja', 'excerpt_ja', 'content_ja',
                      'title_es', 'excerpt_es', 'content_es',
                      'title_pt', 'excerpt_pt', 'content_pt'):
            val = item.get(field)
            if val:
                payload[field] = val

        if not payload:
            print(f'[WARN] {post_id}: 번역 필드 없음, 스킵')
            failed += 1
            continue

        enc_id = urllib.parse.quote(post_id, safe='')
        status, resp = supabase_patch(
            supabase_url, supabase_key,
            'blog_posts', f'id=eq.{enc_id}',
            payload,
        )
        if status in (200, 204):
            print(f'  ✅ {post_id} ({", ".join(k for k in payload.keys())})')
            success += 1
        else:
            print(f'  ❌ {post_id} (HTTP {status}): {resp}')
            failed += 1

    print(f'\n[완료] PATCH 성공: {success}개 | 실패: {failed}개')
    return success, failed


def main():
    parser = argparse.ArgumentParser(description='blog_posts 다국어(JA/ES/PT) 번역 백필')
    parser.add_argument('--fetch',       action='store_true', help='미번역 포스트 조회')
    parser.add_argument('--patch',       action='store_true', help='번역 결과 PATCH')
    parser.add_argument('--exam-id',     default=None,        help='특정 exam_id만 처리 (--fetch 시)')
    parser.add_argument('--input-file',  default='output/translated_blog_posts.json',
                        help='번역 결과 JSON 파일 (--patch 시)')
    args = parser.parse_args()

    if not args.fetch and not args.patch:
        parser.print_help()
        sys.exit(1)

    # .env 로드
    env_path = Path('.env')
    env = load_env(env_path)
    supabase_url = env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL', '')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

    if not supabase_url or not supabase_key:
        print('[ERROR] .env 파일에 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
        sys.exit(1)

    if args.fetch:
        fetch_needs_translation(supabase_url, supabase_key, exam_id=args.exam_id)

    if args.patch:
        patch_translations(supabase_url, supabase_key, args.input_file)


if __name__ == '__main__':
    main()
