#!/usr/bin/env python3
"""
insert_blog_supabase.py — draft_blog_posts.json → Supabase blog_posts 테이블 INSERT

사용법:
  python3 insert_blog_supabase.py \
    --input-file output/draft_blog_posts.json
    [--publish]     # is_published=true로 즉시 게시 (기본: false, 초안)
    [--dry-run]     # 실제 삽입 없이 검증만

모드:
  기본:      is_published=false (초안 저장)
  --publish: is_published=true, published_at=NOW()
  --dry-run: 실제 삽입 없이 필수 필드 검증·slug 중복 체크만 수행
"""

import json
import argparse
import sys
import ssl
import math
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone


# ── SSL 컨텍스트 ──────────────────────────────────────────────────────────────

def _ssl_context() -> ssl.SSLContext:
    """macOS Python 환경에서 시스템 CA 번들을 우선 사용하는 SSL 컨텍스트."""
    ctx = ssl.create_default_context()
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

def _headers(key: str) -> dict:
    return {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
    }


def supabase_get(url: str, key: str, table: str, params: str = '') -> tuple[int, object]:
    """GET 요청 — slug 중복 체크에 사용."""
    endpoint = f"{url}/rest/v1/{table}"
    if params:
        endpoint = f"{endpoint}?{params}"
    req = urllib.request.Request(endpoint, method='GET', headers=_headers(key))
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


def supabase_post(url: str, key: str, table: str, body: object) -> tuple[int, str]:
    """POST 요청 — blog_posts INSERT."""
    endpoint = f"{url}/rest/v1/{table}"
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    headers = _headers(key)
    headers['Prefer'] = 'return=representation'
    req = urllib.request.Request(endpoint, data=data, method='POST', headers=headers)
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')


# ── 유틸리티 ──────────────────────────────────────────────────────────────────

def calc_read_time(content: str) -> int:
    """한국어 기준 읽기 시간 (글자 수 / 500, 최소 1분)."""
    return max(1, math.ceil(len(content) / 500))


def check_slug_duplicate(supabase_url: str, supabase_key: str, slug: str) -> bool:
    """slug 중복 여부 확인. True = 중복 존재."""
    enc_slug = urllib.parse.quote(slug, safe='')
    status, data = supabase_get(
        supabase_url, supabase_key,
        'blog_posts',
        f'slug=eq.{enc_slug}&select=id',
    )
    if status == 200 and isinstance(data, list) and len(data) > 0:
        return True
    return False


def normalize_ref_links(ref_links_raw) -> list:
    """ref_links 필드를 list로 정규화 (str → JSON 파싱, None → [])."""
    if ref_links_raw is None:
        return []
    if isinstance(ref_links_raw, str):
        try:
            parsed = json.loads(ref_links_raw)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []
    if isinstance(ref_links_raw, list):
        return ref_links_raw
    return []


# ── 단일 포스트 삽입 ──────────────────────────────────────────────────────────

def insert_blog_post(
    post: dict,
    supabase_url: str,
    supabase_key: str,
    publish: bool,
    dry_run: bool,
) -> tuple[bool, str]:
    """
    blog_posts 테이블에 포스트 1개 삽입.
    반환: (success, message)  — 성공 시 message = UUID, 실패 시 message = 오류 내용
    """
    slug    = (post.get('slug')    or '').strip()
    title   = (post.get('title')   or '').strip()
    content = (post.get('content') or '').strip()

    # ── 필수 필드 검증 ───────────────────────────────────────────────────────
    missing = [f for f, v in [('slug', slug), ('title', title), ('content', content)] if not v]
    if missing:
        return False, f"필수 필드 누락: {missing}"

    # ── slug 중복 체크 ───────────────────────────────────────────────────────
    if not dry_run:
        if check_slug_duplicate(supabase_url, supabase_key, slug):
            return False, f"slug 중복: '{slug}' — 이미 존재하는 슬러그입니다."

    # ── ref_links 정규화 ─────────────────────────────────────────────────────
    ref_links_val = normalize_ref_links(post.get('ref_links'))

    # ── read_time_minutes 계산 ───────────────────────────────────────────────
    read_time = post.get('read_time_minutes')
    if not read_time or not isinstance(read_time, int) or read_time < 1:
        read_time = calc_read_time(content)

    # ── 발행 시간 ────────────────────────────────────────────────────────────
    now_iso = datetime.now(timezone.utc).isoformat()

    body = {
        'slug':              slug,
        'provider':          (post.get('provider') or 'aws').lower(),
        'exam_id':           post.get('exam_id') or None,
        'category':          post.get('category') or None,
        'tags':              post.get('tags') or [],
        'title':             title,
        'title_en':          post.get('title_en') or None,
        'excerpt':           post.get('excerpt') or None,
        'excerpt_en':        post.get('excerpt_en') or None,
        'content':           content,
        'content_en':        post.get('content_en') or None,
        'cover_image_url':   post.get('cover_image_url') or None,
        'read_time_minutes': read_time,
        'ref_links':         ref_links_val,
        'is_published':      publish,
        'published_at':      now_iso if publish else None,
        'is_pinned':         bool(post.get('is_pinned', False)),
    }

    if dry_run:
        return True, f"[DRY-RUN] '{slug}' 검증 통과"

    # ── 실제 INSERT ──────────────────────────────────────────────────────────
    status, resp_body = supabase_post(supabase_url, supabase_key, 'blog_posts', body)
    if status in (200, 201):
        try:
            resp_json = json.loads(resp_body)
            post_id = (resp_json[0]['id'] if isinstance(resp_json, list) else resp_json.get('id', ''))
        except Exception:
            post_id = '(ID 파싱 실패)'
        return True, post_id
    else:
        return False, f"HTTP {status}: {resp_body[:300]}"


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='draft_blog_posts.json → Supabase blog_posts INSERT'
    )
    parser.add_argument(
        '--input-file', default='output/draft_blog_posts.json',
        help='블로그 포스트 초안 JSON 파일 (기본: output/draft_blog_posts.json)'
    )
    parser.add_argument(
        '--publish', action='store_true',
        help='is_published=true로 즉시 게시 (기본: false, 초안 저장)'
    )
    parser.add_argument(
        '--dry-run', action='store_true',
        help='실제 삽입 없이 필수 필드 검증·slug 중복 체크만 수행'
    )
    args = parser.parse_args()

    # ── .env 읽기 ────────────────────────────────────────────────────────────
    script_dir = Path(__file__).resolve().parent
    # 스크립트 위치: .claude/skills/sql-generator/scripts/ → 4단계 상위 = 프로젝트 루트
    project_root = script_dir.parents[3]
    env = load_env(project_root / '.env')

    supabase_url = (env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env 파일에서 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.')
        print('다음 형식으로 프로젝트 루트에 .env 파일을 생성하세요:')
        print('  SUPABASE_URL=https://xxx.supabase.co')
        print('  SUPABASE_SERVICE_ROLE_KEY=eyJ...')
        sys.exit(1)

    # ── 입력 파일 읽기 ───────────────────────────────────────────────────────
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f'[ERROR] 입력 파일 없음: {input_path}')
        sys.exit(1)

    posts = json.loads(input_path.read_text(encoding='utf-8'))
    if not isinstance(posts, list) or not posts:
        print('[ERROR] 삽입할 포스트가 없습니다.')
        sys.exit(1)

    # ── 처리 시작 ────────────────────────────────────────────────────────────
    mode_label = '[DRY-RUN]' if args.dry_run else ('[게시]' if args.publish else '[초안]')
    print(f'{mode_label} {len(posts)}개 포스트 처리 시작...\n')

    success_items = []   # (slug, uuid)
    failed_slugs  = []   # (slug, reason)

    for post in posts:
        slug = (post.get('slug') or '?').strip()
        success, msg = insert_blog_post(
            post, supabase_url, supabase_key,
            publish=args.publish,
            dry_run=args.dry_run,
        )
        if success:
            print(f'  [OK]   {slug}')
            if not args.dry_run:
                print(f'         UUID: {msg}')
            success_items.append((slug, msg))
        else:
            print(f'  [FAIL] {slug} — {msg}')
            failed_slugs.append((slug, msg))

    # ── 결과 요약 ────────────────────────────────────────────────────────────
    print(f'\n[완료] 성공: {len(success_items)}개 | 실패: {len(failed_slugs)}개')
    if failed_slugs:
        print('\n실패 목록:')
        for slug, reason in failed_slugs:
            print(f'  - {slug}: {reason}')
        sys.exit(1)


if __name__ == '__main__':
    main()
