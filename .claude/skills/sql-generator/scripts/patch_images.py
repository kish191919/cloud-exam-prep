#!/usr/bin/env python3
"""
cover_image_url이 NULL인 blog_posts 및 announcements에 Unsplash 이미지 URL을 일괄 PATCH합니다.

사용법:
  python3 patch_images.py --blog              # blog_posts 전체 패치
  python3 patch_images.py --board             # announcements 전체 패치
  python3 patch_images.py --blog --board      # 둘 다 패치
  python3 patch_images.py --blog --dry-run    # 미리보기 (실제 PATCH 없음)
"""

import argparse
import json
import os
import ssl
import sys
import urllib.request
import urllib.error

# ── Unsplash 이미지 매핑 ──────────────────────────────────────────────────────
BASE = "https://images.unsplash.com/photo-{id}?w=1200&h=630&fit=crop&q=80"

BLOG_IMAGE_MAP = {
    # content_type 키 (Blog Writer Agent 출력)
    "overview":           BASE.format(id="1451187580459-43490279c0fa"),
    "domain_guide":       BASE.format(id="1558494949-ef010cbdcc31"),
    "service_comparison": BASE.format(id="1518770660439-4636190af475"),
    "exam_strategy":      BASE.format(id="1434030216411-0b793f4b4173"),
    # category (한국어, DB 저장값)
    "자격증 개요":          BASE.format(id="1451187580459-43490279c0fa"),
    "도메인 가이드":         BASE.format(id="1558494949-ef010cbdcc31"),
    "서비스 비교":           BASE.format(id="1518770660439-4636190af475"),
    "시험 전략":             BASE.format(id="1434030216411-0b793f4b4173"),
    "default":            BASE.format(id="1607799279861-4dd421887fb3"),  # 클라우드 일반
}

# 게시판: 제목 키워드 → 이미지
BOARD_KEYWORD_MAP = [
    (["연봉", "salary", "career", "취업", "커리어"],
     BASE.format(id="1554224155-6726b3ff858f")),   # 비즈니스/커리어
    (["aws", "amazon"],
     BASE.format(id="1451187580459-43490279c0fa")), # 클라우드/인프라
    (["gcp", "google", "azure", "microsoft"],
     BASE.format(id="1607799279861-4dd421887fb3")), # 클라우드 일반
    (["시험", "자격증", "exam", "certification"],
     BASE.format(id="1434030216411-0b793f4b4173")), # 시험/학습
]
BOARD_DEFAULT = BASE.format(id="1607799279861-4dd421887fb3")


# ── SSL 컨텍스트 ─────────────────────────────────────────────────────────────
def _ssl_context():
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if os.path.exists(ca_path):
            ctx.load_verify_locations(ca_path)
            break
    return ctx


# ── 환경 변수 로드 ────────────────────────────────────────────────────────────
def load_env():
    # 1) 스크립트 기준 상대 경로
    candidates = [
        os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../.env")),
        # 2) 현재 작업 디렉터리
        os.path.join(os.getcwd(), ".env"),
    ]
    env_path = next((p for p in candidates if os.path.exists(p)), None)
    if env_path is None:
        print("❌ .env 파일을 찾을 수 없습니다.")
        sys.exit(1)
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())


# ── Supabase REST API 헬퍼 ────────────────────────────────────────────────────
def supabase_get(url, key, path, params=""):
    full = f"{url}/rest/v1/{path}{params}"
    req = urllib.request.Request(full, headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
    })
    with urllib.request.urlopen(req, context=_ssl_context()) as r:
        return json.loads(r.read())


def supabase_patch(url, key, path, record_id, data):
    full = f"{url}/rest/v1/{path}?id=eq.{record_id}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(full, data=body, method="PATCH", headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    })
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as r:
            return True, r.read()
    except urllib.error.HTTPError as e:
        return False, e.read()


# ── blog_posts 패치 ───────────────────────────────────────────────────────────
def patch_blog(supabase_url, key, dry_run):
    print("\n📚 blog_posts 이미지 패치")
    rows = supabase_get(
        supabase_url, key,
        "blog_posts",
        "?select=id,category,title&cover_image_url=is.null&order=created_at.asc"
    )
    if not rows:
        print("  ✅ 이미지가 없는 포스트 없음 — 완료")
        return 0, 0

    print(f"  발견: {len(rows)}개 포스트")
    success = fail = 0
    for row in rows:
        ct = row.get("category", "")
        img_url = BLOG_IMAGE_MAP.get(ct, BLOG_IMAGE_MAP["default"])
        title = row.get("title", "")[:50]
        print(f"  [{ct or '?'}] {title} → {img_url[:60]}...")
        if dry_run:
            continue
        ok, _ = supabase_patch(supabase_url, key, "blog_posts", row["id"], {
            "cover_image_url": img_url
        })
        if ok:
            success += 1
        else:
            fail += 1
            print(f"    ❌ PATCH 실패: {row['id']}")

    if not dry_run:
        print(f"\n  결과: 성공 {success}개 | 실패 {fail}개")
    return success, fail


# ── announcements 패치 ────────────────────────────────────────────────────────
def pick_board_image(title: str) -> str:
    title_lower = title.lower()
    for keywords, url in BOARD_KEYWORD_MAP:
        if any(kw in title_lower for kw in keywords):
            return url
    return BOARD_DEFAULT


def patch_board(supabase_url, key, dry_run):
    print("\n📋 announcements 이미지 패치")
    rows = supabase_get(
        supabase_url, key,
        "announcements",
        "?select=id,title&cover_image_url=is.null&order=created_at.asc"
    )
    if not rows:
        print("  ✅ 이미지가 없는 게시글 없음 — 완료")
        return 0, 0

    print(f"  발견: {len(rows)}개 게시글")
    success = fail = 0
    for row in rows:
        img_url = pick_board_image(row.get("title", ""))
        title = row.get("title", "")[:50]
        print(f"  {title} → {img_url[:60]}...")
        if dry_run:
            continue
        ok, _ = supabase_patch(supabase_url, key, "announcements", row["id"], {
            "cover_image_url": img_url
        })
        if ok:
            success += 1
        else:
            fail += 1
            print(f"    ❌ PATCH 실패: {row['id']}")

    if not dry_run:
        print(f"\n  결과: 성공 {success}개 | 실패 {fail}개")
    return success, fail


# ── 메인 ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="cover_image_url NULL 일괄 패치")
    parser.add_argument("--blog",    action="store_true", help="blog_posts 패치")
    parser.add_argument("--board",   action="store_true", help="announcements 패치")
    parser.add_argument("--dry-run", action="store_true", help="미리보기 (변경 없음)")
    args = parser.parse_args()

    if not args.blog and not args.board:
        parser.print_help()
        sys.exit(1)

    load_env()
    supabase_url = (os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL", "")).rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not key:
        print("❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env에 없습니다.")
        sys.exit(1)

    if args.dry_run:
        print("🔍 DRY RUN 모드 — 실제 변경 없음\n")

    total_ok = total_fail = 0

    if args.blog:
        ok, fail = patch_blog(supabase_url, key, args.dry_run)
        total_ok += ok
        total_fail += fail

    if args.board:
        ok, fail = patch_board(supabase_url, key, args.dry_run)
        total_ok += ok
        total_fail += fail

    if not args.dry_run:
        print(f"\n✅ 패치 완료 — 총 성공 {total_ok}개 | 실패 {total_fail}개")
    else:
        print("\n🔍 DRY RUN 완료 — 위 항목에 이미지가 할당됩니다.")


if __name__ == "__main__":
    main()
