#!/usr/bin/env python3
"""
generate_sql.py — redesigned_questions.json → SQL INSERT 파일 생성

입력: output/redesigned_questions.json
출력: output/{exam_id}-YYYYMMDD-{batch:03d}.sql

⚠️ key_point_images 컬럼은 DB에 존재하지 않으므로 INSERT 구문에서 제외

사용법:
  python3 generate_sql.py \
    --input-file output/redesigned_questions.json \
    --set-id 550e8400-e29b-41d4-a716-446655440001 \
    --exam-id aws-aif-c01 \
    --output-dir output \
    [--sort-order-start 66]

  # 영문 필드만 UPDATE (기존 문제에 영문 백필):
  python3 generate_sql.py \
    --input-file output/redesigned_questions.json \
    --exam-id aws-aif-c01 \
    --output-dir output \
    --patch-en
"""

import json
import argparse
import re
from datetime import datetime
from pathlib import Path


# ── SQL 이스케이프 ────────────────────────────────────────────────────────────

def esc(value: str) -> str:
    """PostgreSQL 문자열 이스케이프: 작은따옴표 → ''"""
    if value is None:
        return 'NULL'
    return value.replace("'", "''")


# ── INSERT 블록 생성 ──────────────────────────────────────────────────────────

def make_question_block(q: dict, set_id: str, sort_order: int) -> str:
    """단일 문제에 대한 SQL 블록 (questions + options + tags + exam_set_questions)."""

    qid = q['id']
    exam_id = q['exam_id']
    text = esc(q['text'])
    text_en_val = q.get('text_en') or ''
    text_en = esc(text_en_val) if text_en_val else None
    correct = q['correct_option_id']
    explanation = esc(q['explanation'])
    explanation_en_val = q.get('explanation_en') or ''
    explanation_en = esc(explanation_en_val) if explanation_en_val else None
    key_points = esc(q.get('key_points') or '')
    key_points_en_val = q.get('key_points_en') or ''
    key_points_en = esc(key_points_en_val) if key_points_en_val else None

    # ref_links: JSON 문자열 또는 리스트 → 문자열로 통일
    ref_links_raw = q.get('ref_links', '[]')
    if isinstance(ref_links_raw, list):
        ref_links_str = json.dumps(ref_links_raw, ensure_ascii=False)
    else:
        ref_links_str = ref_links_raw
    ref_links = esc(ref_links_str)

    # NULL or quoted string helper
    def sql_str(val):
        return f"'{val}'" if val is not None else 'NULL'

    # ── questions INSERT ──────────────────────────────────────────────────────
    lines = [
        f"-- ── 문제: {qid} ────────────────────────────────────────────",
        "INSERT INTO questions (id, exam_id, text, text_en, correct_option_id, explanation, explanation_en, key_points, key_points_en, ref_links)",
        "VALUES (",
        f"  '{qid}',",
        f"  '{exam_id}',",
        f"  '{text}',",
        f"  {sql_str(text_en)},",
        f"  '{correct}',",
        f"  '{explanation}',",
        f"  {sql_str(explanation_en)},",
        f"  '{key_points}',",
        f"  {sql_str(key_points_en)},",
        f"  '{ref_links}'::jsonb",
        ");",
        "",
    ]

    # ── question_options INSERT ───────────────────────────────────────────────
    options = q.get('options', [])
    if not options:
        raise ValueError(f"문제 {qid}에 options가 없습니다.")

    option_rows = []
    for opt in options:
        oid = opt['option_id']
        otext = esc(opt['text'])
        otext_en_val = opt.get('text_en') or ''
        otext_en = esc(otext_en_val) if otext_en_val else None
        oexpl = esc(opt.get('explanation') or '')
        oexpl_en_val = opt.get('explanation_en') or ''
        oexpl_en = esc(oexpl_en_val) if oexpl_en_val else None
        osort = int(opt['sort_order'])
        option_rows.append(
            f"  ('{qid}', '{oid}', '{otext}', {sql_str(otext_en)}, '{oexpl}', {sql_str(oexpl_en)}, {osort})"
        )

    lines.append("INSERT INTO question_options (question_id, option_id, text, text_en, explanation, explanation_en, sort_order) VALUES")
    lines.append(',\n'.join(option_rows) + ';')
    lines.append("")

    # ── question_tags INSERT ──────────────────────────────────────────────────
    tag = esc(q.get('tag', ''))
    lines.append(f"INSERT INTO question_tags (question_id, tag) VALUES ('{qid}', '{tag}');")
    lines.append("")

    # ── exam_set_questions INSERT ─────────────────────────────────────────────
    lines.append("INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES")
    lines.append(f"  ('{set_id}', '{qid}', {sort_order});")
    lines.append("")

    return '\n'.join(lines)


# ── UPDATE 블록 생성 (--patch-en 모드) ────────────────────────────────────────

def make_patch_en_block(q: dict) -> str:
    """영문 필드만 UPDATE하는 SQL 블록 (기존 문제 백필용)."""

    qid = q['id']

    def sql_str(val):
        return f"'{val}'" if val is not None else 'NULL'

    text_en_val = q.get('text_en') or ''
    text_en = esc(text_en_val) if text_en_val else None
    explanation_en_val = q.get('explanation_en') or ''
    explanation_en = esc(explanation_en_val) if explanation_en_val else None
    key_points_en_val = q.get('key_points_en') or ''
    key_points_en = esc(key_points_en_val) if key_points_en_val else None

    lines = [
        f"-- ── 패치: {qid} ────────────────────────────────────────────",
        f"UPDATE questions SET",
        f"  text_en = {sql_str(text_en)},",
        f"  explanation_en = {sql_str(explanation_en)},",
        f"  key_points_en = {sql_str(key_points_en)}",
        f"WHERE id = '{qid}';",
        "",
    ]

    for opt in q.get('options', []):
        oid = opt['option_id']
        otext_en_val = opt.get('text_en') or ''
        otext_en = esc(otext_en_val) if otext_en_val else None
        oexpl_en_val = opt.get('explanation_en') or ''
        oexpl_en = esc(oexpl_en_val) if oexpl_en_val else None
        lines.append(
            f"UPDATE question_options SET text_en = {sql_str(otext_en)}, explanation_en = {sql_str(oexpl_en)} "
            f"WHERE question_id = '{qid}' AND option_id = '{oid}';"
        )

    lines.append("")
    return '\n'.join(lines)


# ── 배치 번호 결정 ────────────────────────────────────────────────────────────

def next_batch_number(output_dir: Path, exam_id: str, date_str: str) -> int:
    """같은 날짜의 기존 SQL 파일 중 최대 배치 번호 + 1 반환."""
    pattern = re.compile(
        rf'^{re.escape(exam_id)}-{re.escape(date_str)}-(\d{{3}})\.sql$'
    )
    max_batch = 0
    for f in output_dir.glob(f'{exam_id}-{date_str}-*.sql'):
        m = pattern.match(f.name)
        if m:
            max_batch = max(max_batch, int(m.group(1)))
    return max_batch + 1


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='AWS 시험 문제 SQL 파일 생성기')
    parser.add_argument('--input-file', default='output/redesigned_questions.json',
                        help='재설계된 문제 JSON 파일 (기본: output/redesigned_questions.json)')
    parser.add_argument('--set-id', default=None,
                        help='exam_sets UUID (Supabase) — INSERT 모드에서 필수')
    parser.add_argument('--exam-id', default='aws-aif-c01',
                        help='시험 ID (기본: aws-aif-c01)')
    parser.add_argument('--output-dir', default='output',
                        help='SQL 파일 저장 디렉토리 (기본: output)')
    parser.add_argument('--sort-order-start', type=int, default=1,
                        help='exam_set_questions.sort_order 시작값 (기본: 1)')
    parser.add_argument('--patch-en', action='store_true',
                        help='영문 필드(text_en 등)만 UPDATE하는 패치 SQL 생성 (기존 문제 백필용)')
    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f'[ERROR] 입력 파일 없음: {input_path}')
        raise SystemExit(1)

    questions = json.loads(input_path.read_text(encoding='utf-8'))
    if not questions:
        print('[ERROR] 재설계된 문제가 없습니다.')
        raise SystemExit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime('%Y%m%d')
    ids = [q['id'] for q in questions]
    first_id = ids[0] if ids else 'N/A'
    last_id = ids[-1] if ids else 'N/A'

    # ── patch-en 모드 ──────────────────────────────────────────────────────────
    if args.patch_en:
        blocks = [make_patch_en_block(q) for q in questions]
        header = (
            f"-- ============================================================\n"
            f"-- {args.exam_id} 영문 필드 패치 (text_en / explanation_en / key_points_en)\n"
            f"-- 생성일: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"-- 대상 ID 범위: {first_id} ~ {last_id}\n"
            f"-- ⚠️ Supabase SQL Editor에서 실행하세요\n"
            f"-- ============================================================\n\n"
        )
        output_filename = f'{args.exam_id}-{date_str}-patch-en.sql'
        output_path = output_dir / output_filename
        output_path.write_text(header + '\n'.join(blocks), encoding='utf-8')
        print(f'[OK] 패치 SQL 파일 생성: {output_path}')
        print(f'[OK] 총 {len(questions)}개 문제 | ID 범위: {first_id} ~ {last_id}')
        return

    # ── INSERT 모드 ────────────────────────────────────────────────────────────
    if not args.set_id:
        print('[ERROR] INSERT 모드에서는 --set-id가 필요합니다.')
        raise SystemExit(1)

    batch_num = next_batch_number(output_dir, args.exam_id, date_str)
    output_filename = f'{args.exam_id}-{date_str}-{batch_num:03d}.sql'
    output_path = output_dir / output_filename

    blocks = []
    sort_order = args.sort_order_start
    for q in questions:
        block = make_question_block(q, args.set_id, sort_order)
        blocks.append(block)
        sort_order += 1

    # 템플릿 읽기
    template_path = Path(__file__).parent / 'templates' / 'insert_template.sql'
    if template_path.exists():
        template = template_path.read_text(encoding='utf-8')
        content = template.format(
            exam_id=args.exam_id,
            date=datetime.now().strftime('%Y-%m-%d'),
            first_id=first_id,
            last_id=last_id,
            question_blocks='\n'.join(blocks),
        )
    else:
        content = '\n'.join(blocks)

    output_path.write_text(content, encoding='utf-8')

    print(f'[OK] SQL 파일 생성: {output_path}')
    print(f'[OK] 총 {len(questions)}개 문제 | ID 범위: {first_id} ~ {last_id}')


if __name__ == '__main__':
    main()
