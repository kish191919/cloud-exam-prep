#!/usr/bin/env python3
"""
parse_text.py — 영문/한국어 AWS 시험 문제 텍스트를 파싱하여 parsed_questions.json 생성

입력: 표준 입력(stdin) 또는 --input-file 파라미터로 텍스트 파일 경로 지정
출력: output/parsed_questions.json (JSON 배열)

지원 입력 형식:
  1. 문제 번호 있음: "21. Question text" 또는 "Q21. Question text"
  2. 문제 번호 없음: "Question text" (자동 번호 부여)
  3. 보기: "A. Option" / "A) Option" (대소문자 무관)
  4. 정답 (영문): "Correct answer: D" / "Correct Answer: D, E" / "Answer: D"
     정답 (한국어): "정답: D" / "정답: D, E"
     정답 구분자: 콤마, 슬래시, 공백, 'and'
  5. 해설 줄 자동 스킵: "Explanation:" / "해설:" / "설명:"

사용법:
  python3 parse_text.py --input-file /path/to/questions.txt \
                        --output-file output/parsed_questions.json \
                        --exam-id aws-aif-c01 \
                        --start-id 166

  # stdin에서 읽기:
  echo "..." | python3 parse_text.py --exam-id aws-aif-c01 --start-id 166
"""

import sys
import re
import json
import argparse
from pathlib import Path


# ── 정규식 패턴 ───────────────────────────────────────────────────────────────

# 문제 번호 패턴 (선택적): "21." / "Q21." / "Question 21." / "21)"
RE_Q_NUMBER = re.compile(
    r'^(?:Q(?:uestion)?\s*)?(\d+)[.)]\s+',
    re.IGNORECASE
)

# 보기 패턴: "A." / "A)" / "(A)" / "A -"
RE_OPTION = re.compile(
    r'^\s*(?:\()?([A-Ea-e])[.)]\s+(.+)',
)

# 정답 행 패턴: "Correct answer: D" / "Answer: D, E" / "Correct Answer: B and C" / "Answer: AC"
# 한국어: "정답: D" / "정답: D, E"
# [A-Ea-e]+ 로 구분자 없는 연속 문자(AC, BCE 등)도 캡처
RE_ANSWER_LINE = re.compile(
    r'(?:correct\s+answer|answer|정답)\s*:?\s*([A-Ea-e]+(?:\s*[,/]\s*[A-Ea-e]+|\s+and\s+[A-Ea-e]+)*)',
    re.IGNORECASE
)

# 답안 구분자
RE_ANSWER_SPLIT = re.compile(r'[,/\s]+(?:and\s+)?|and\s+', re.IGNORECASE)


# ── 파서 핵심 로직 ────────────────────────────────────────────────────────────

def parse_questions(raw_text: str) -> list[dict]:
    """원문 텍스트에서 문제 블록을 추출하여 구조화된 리스트 반환."""

    # 줄 끝 정규화
    lines = raw_text.replace('\r\n', '\n').replace('\r', '\n').split('\n')

    blocks = _split_into_blocks(lines)
    questions = []
    auto_number = 1

    for block in blocks:
        q = _parse_block(block, auto_number)
        if q:
            if q['number'] == auto_number:
                auto_number += 1
            else:
                auto_number = q['number'] + 1
            questions.append(q)

    return questions


def _split_into_blocks(lines: list[str]) -> list[list[str]]:
    """
    문제 블록 분리 전략:
    1. "Answer" 단독 행 또는 "Correct answer:" 행 이후 빈 줄이 오면 블록 종료
    2. 연속된 빈 줄(2개 이상)도 블록 경계로 처리
    3. 새 문제 번호("21. ..." 패턴)가 오면 새 블록 시작
    """
    blocks: list[list[str]] = []
    current: list[str] = []
    after_answer = False
    blank_count = 0

    for line in lines:
        stripped = line.strip()

        # 빈 줄 처리
        if not stripped:
            blank_count += 1
            if after_answer or blank_count >= 2:
                if current:
                    blocks.append(current)
                    current = []
                    after_answer = False
            else:
                current.append(line)
            continue

        blank_count = 0

        # after_answer 상태에서 비어 있지 않은 새 줄이 오면 블록 분리
        # (빈 줄 없이 다음 문제가 시작되는 경우 처리)
        if after_answer:
            # "Answer" 단독 행, 정답 행, Explanation 행은 현재 블록에 유지
            # (Explanation은 현재 문제의 일부이므로 다음 문제 블록으로 넘기지 않음)
            is_answer_related = (
                re.match(r'^answer\s*$', stripped, re.IGNORECASE)
                or RE_ANSWER_LINE.match(stripped)
                or re.match(r'^explanation\s*:', stripped, re.IGNORECASE)
            )
            if not is_answer_related:
                if current:
                    blocks.append(current)
                    current = []
                    after_answer = False

        # 정답 행 감지 → 다음 빈 줄 또는 다음 비관련 줄에서 블록 종료
        if RE_ANSWER_LINE.match(stripped):
            current.append(line)
            after_answer = True
            continue

        # "Answer" 단독 행 (정답 레이블)
        if re.match(r'^answer\s*$', stripped, re.IGNORECASE):
            current.append(line)
            continue

        # 새 문제 번호가 오면 이전 블록 저장 후 새 블록 시작
        if RE_Q_NUMBER.match(stripped) and current:
            # 현재 블록에 이미 정답이 없으면 저장하지 않고 이어붙임 가능성
            # → 정답이 있는 경우에만 분리
            if any(RE_ANSWER_LINE.search(l) for l in current):
                blocks.append(current)
                current = []
                after_answer = False

        current.append(line)

    if current:
        blocks.append(current)

    return blocks


def _parse_block(block_lines: list[str], auto_number: int) -> dict | None:
    """단일 문제 블록에서 번호, 질문, 보기, 정답 추출."""

    text_lines: list[str] = []
    options: dict[str, str] = {}
    answer_raw: str = ''
    option_order = ['a', 'b', 'c', 'd', 'e']
    seen_option_keys: list[str] = []
    in_question = True

    for line in block_lines:
        stripped = line.strip()

        # 빈 줄 — 질문 종료 신호 (단, 보기 섹션 이전만)
        if not stripped:
            if in_question and not options:
                text_lines.append('')
            continue

        # "Answer" 단독 행 스킵
        if re.match(r'^answer\s*$', stripped, re.IGNORECASE):
            continue

        # "Explanation:" / "해설:" / "설명:" 줄 스킵 (원문 해설 — 재설계에서 새로 생성하므로 불필요)
        if re.match(r'^(?:explanation|해설|설명)\s*:', stripped, re.IGNORECASE):
            continue

        # 정답 행
        m_ans = RE_ANSWER_LINE.match(stripped)
        if m_ans:
            answer_raw = m_ans.group(1).strip()
            continue

        # 보기 행
        m_opt = RE_OPTION.match(stripped)
        if m_opt:
            in_question = False
            key = m_opt.group(1).lower()
            val = m_opt.group(2).strip()
            # 보기가 여러 줄에 걸칠 수 있으므로 key 중복 시 이어붙임
            if key in options:
                options[key] += ' ' + val
            else:
                options[key] = val
                seen_option_keys.append(key)
            continue

        # 질문 본문 또는 보기 연속 행
        if not in_question and seen_option_keys:
            # 이전 보기의 연속 행
            last_key = seen_option_keys[-1]
            options[last_key] += ' ' + stripped
        else:
            text_lines.append(stripped)

    # 질문 본문 추출 (번호 제거)
    full_text = '\n'.join(text_lines).strip()
    if not full_text:
        return None

    # 번호 추출
    q_number = auto_number
    m_num = RE_Q_NUMBER.match(full_text)
    if m_num:
        q_number = int(m_num.group(1))
        full_text = full_text[m_num.end():].strip()

    if not full_text:
        return None

    # 정답 파싱
    if not answer_raw:
        return None  # 정답 없는 블록은 스킵

    # 구분자로 분리 후, 구분자 없는 연속 문자(예: "AC" → ['a','c'])도 개별 분리
    parts = [a.strip().lower() for a in RE_ANSWER_SPLIT.split(answer_raw) if a.strip()]
    answer_letters = []
    for part in parts:
        if len(part) == 1 and part in 'abcde':
            answer_letters.append(part)
        else:
            answer_letters.extend(c for c in part if c in 'abcde')

    if not answer_letters:
        return None

    # 정답이 1개면 단일 문자열, 여러 개면 쉼표 구분
    answer_field = answer_letters[0] if len(answer_letters) == 1 else ','.join(answer_letters)

    # 보기가 없으면 스킵
    if not options:
        return None

    return {
        'number': q_number,
        'question': full_text,
        'options': options,
        'answer': answer_field,
        'option_count': len(options),
        'status': 'pending',
        'assigned_id': None,   # Main이 나중에 채워 넣음
    }


# ── ID 할당 ───────────────────────────────────────────────────────────────────

def assign_ids(questions: list[dict], exam_id: str, start_num: int) -> list[dict]:
    """각 문제에 sequential ID 할당 (assigned_id가 None인 것만)."""
    exam_code = exam_id.replace('-', '')  # 'aws-aif-c01' → 'awsaifc01'
    counter = start_num
    for q in questions:
        if q['assigned_id'] is None:
            q['assigned_id'] = f'{exam_code}-q{counter:03d}'
            counter += 1
    return questions


# ── 검증 ──────────────────────────────────────────────────────────────────────

def validate(questions: list[dict]) -> tuple[list[dict], list[dict]]:
    """필수 필드 검증. (valid_list, failed_list) 반환."""
    valid, failed = [], []
    for q in questions:
        errors = []
        if not q.get('question'):
            errors.append('question 필드 없음')
        if not q.get('options'):
            errors.append('options 필드 없음')
        if not q.get('answer'):
            errors.append('answer 필드 없음')
        if q.get('option_count', 0) < 2:
            errors.append(f"보기 수 부족: {q.get('option_count')}")

        if errors:
            q['status'] = 'failed'
            q['errors'] = errors
            failed.append(q)
        else:
            valid.append(q)
    return valid, failed


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='AWS 시험 문제 텍스트 파서')
    parser.add_argument('--input-file', help='입력 텍스트 파일 경로 (없으면 stdin)')
    parser.add_argument('--output-file', default='output/parsed_questions.json',
                        help='출력 JSON 파일 경로 (기본: output/parsed_questions.json)')
    parser.add_argument('--exam-id', default='aws-aif-c01',
                        help='시험 ID (기본: aws-aif-c01)')
    parser.add_argument('--start-id', type=int, default=1,
                        help='첫 번째 문제 번호 (DB MAX(id)+1)')
    parser.add_argument('--append', action='store_true',
                        help='기존 output 파일에 추가 (체크포인트 재개)')
    args = parser.parse_args()

    # 입력 읽기
    if args.input_file:
        raw = Path(args.input_file).read_text(encoding='utf-8')
    else:
        raw = sys.stdin.read()

    if not raw.strip():
        print('[ERROR] 입력 텍스트가 없습니다.', file=sys.stderr)
        sys.exit(1)

    # 파싱
    questions = parse_questions(raw)
    if not questions:
        print('[ERROR] 파싱된 문제가 없습니다. 입력 형식을 확인하세요.', file=sys.stderr)
        sys.exit(1)

    # 체크포인트 병합 (--append 모드)
    existing: list[dict] = []
    output_path = Path(args.output_file)
    if args.append and output_path.exists():
        existing = json.loads(output_path.read_text(encoding='utf-8'))
        completed_ids = {q['assigned_id'] for q in existing if q.get('status') == 'completed'}
    else:
        completed_ids = set()

    # ID 할당
    questions = assign_ids(questions, args.exam_id, args.start_id)

    # 이미 완료된 문제 스킵
    new_questions = [q for q in questions if q['assigned_id'] not in completed_ids]

    # 검증
    valid, failed = validate(new_questions)

    if failed:
        print(f'[WARN] 파싱 실패 문제: {len(failed)}개', file=sys.stderr)
        for f in failed:
            print(f"  - 문제 {f.get('number')}: {f.get('errors')}", file=sys.stderr)

    # 출력
    all_questions = existing + valid + failed
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(all_questions, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )

    print(f'[OK] 총 {len(questions)}개 파싱 → 성공 {len(valid)}개, 실패 {len(failed)}개')
    print(f'[OK] 저장: {output_path}')

    # 실패 문제가 있으면 종료 코드 1
    if failed:
        sys.exit(1)


if __name__ == '__main__':
    main()
