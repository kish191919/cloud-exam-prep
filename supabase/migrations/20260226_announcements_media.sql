-- ── 게시판 미디어 필드 추가 ────────────────────────────────────────────────────
-- cover_image_url: 커버 이미지 URL (Unsplash 등 외부 이미지)
-- ref_links: 출처·참고자료 JSON 배열 [{"name":"...","url":"..."}]

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS ref_links       TEXT;
