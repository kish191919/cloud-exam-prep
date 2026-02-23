#!/usr/bin/env python3
"""
parse_text.py — 영문/한국어 AWS 시험 문제 텍스트를 파싱하여 parsed_questions.json 생성

입력: 표준 입력(stdin) 또는 --input-file 파라미터로 텍스트 파일 경로 지정
출력: output/parsed_questions.json (JSON 배열)

지원 입력 형식:
  1. 문제 번호 있음: "21. Question text" 또는 "Q21. Question text"
  2. 문제 번호 없음: "Question text" (자동 번호 부여)
  3. 보기 (알파벳): "A. Option" / "A) Option" (대소문자 무관)
     보기 (숫자):   "1) Option" / "1. Option" (1~5, a/b/c/d/e로 매핑)
  4. 정답 (영문): "Correct answer: D" / "Correct Answer: D, E" / "Answer: D"
     정답 (한국어/알파벳): "정답: D" / "정답: D, E"
     정답 (한국어/숫자):   "정답 : 2" / "정답: 2" (숫자를 알파벳으로 변환)
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

# 보기 패턴 (알파벳): "A." / "A)" / "(A)" / "A -"
RE_OPTION = re.compile(
    r'^\s*(?:\()?([A-Ea-e])[.)]\s+(.+)',
)

# 보기 패턴 (숫자): "1)" / "1." / "1 ." — 1~5까지 (문제 번호와 구분: 앞에 단어 없음)
RE_OPTION_NUMERIC = re.compile(
    r'^\s*([1-5])[.)]\s+(.+)',
)

# 숫자→알파벳 매핑
NUM_TO_LETTER = {'1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e'}

# 정답 행 패턴 (알파벳): "Correct answer: D" / "Answer: D, E" / "정답: D"
RE_ANSWER_LINE = re.compile(
    r'(?:correct\s+answer|answer|정답)\s*:?\s*([A-Ea-e]+(?:\s*[,/]\s*[A-Ea-e]+|\s+and\s+[A-Ea-e]+)*)',
    re.IGNORECASE
)

# 정답 행 패턴 (숫자): "정답 : 2" / "정답: 2, 3" / "정답: 2/3"
RE_ANSWER_LINE_NUMERIC = re.compile(
    r'(?:correct\s+answer|answer|정답)\s*:?\s*([1-5]+(?:\s*[,/]\s*[1-5]+|\s+and\s+[1-5]+)*)',
    re.IGNORECASE
)

# 답안 구분자
RE_ANSWER_SPLIT = re.compile(r'[,/\s]+(?:and\s+)?|and\s+', re.IGNORECASE)


def _is_answer_line(stripped: str) -> bool:
    """정답 행 여부 판별 (알파벳 또는 숫자 형식 모두 허용)."""
    return bool(RE_ANSWER_LINE.match(stripped) or RE_ANSWER_LINE_NUMERIC.match(stripped))


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
    1. "Answer" 단독 행 또는 "Correct answer:" / "정답:" 행 이후 빈 줄이 오면 블록 종료
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
        if after_answer:
            is_answer_related = (
                re.match(r'^answer\s*$', stripped, re.IGNORECASE)
                or _is_answer_line(stripped)
                or re.match(r'^explanation\s*:', stripped, re.IGNORECASE)
            )
            if not is_answer_related:
                if current:
                    blocks.append(current)
                    current = []
                    after_answer = False

        # 정답 행 감지 (알파벳 또는 숫자 형식)
        if _is_answer_line(stripped):
            current.append(line)
            after_answer = True
            continue

        # "Answer" 단독 행 (정답 레이블)
        if re.match(r'^answer\s*$', stripped, re.IGNORECASE):
            current.append(line)
            continue

        # 새 문제 번호가 오면 이전 블록 저장 후 새 블록 시작
        if RE_Q_NUMBER.match(stripped) and current:
            if any(_is_answer_line(l.strip()) for l in current):
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
    answer_is_numeric: bool = False
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

        # "Explanation:" / "해설:" / "설명:" 줄 스킵
        if re.match(r'^(?:explanation|해설|설명)\s*:', stripped, re.IGNORECASE):
            continue

        # 정답 행 (알파벳 형식 먼저 시도)
        m_ans = RE_ANSWER_LINE.match(stripped)
        if m_ans:
            answer_raw = m_ans.group(1).strip()
            answer_is_numeric = False
            continue

        # 정답 행 (숫자 형식)
        m_ans_num = RE_ANSWER_LINE_NUMERIC.match(stripped)
        if m_ans_num:
            answer_raw = m_ans_num.group(1).strip()
            answer_is_numeric = True
            continue

        # 보기 행 (알파벳 형식)
        m_opt = RE_OPTION.match(stripped)
        if m_opt:
            in_question = False
            key = m_opt.group(1).lower()
            val = m_opt.group(2).strip()
            if key in options:
                options[key] += ' ' + val
            else:
                options[key] = val
                seen_option_keys.append(key)
            continue

        # 보기 행 (숫자 형식) — 문제 텍스트가 이미 수집된 경우에만 보기로 인식
        # (문제 본문이 없는 상태에서 "46. 한 의료..." 같은 줄을 보기로 오파싱하지 않도록)
        m_opt_num = RE_OPTION_NUMERIC.match(stripped)
        if m_opt_num and (text_lines or not in_question):
            in_question = False
            num_key = m_opt_num.group(1)
            letter_key = NUM_TO_LETTER[num_key]
            val = m_opt_num.group(2).strip()
            if letter_key in options:
                options[letter_key] += ' ' + val
            else:
                options[letter_key] = val
                seen_option_keys.append(letter_key)
            continue

        # 질문 본문 또는 보기 연속 행
        if not in_question and seen_option_keys:
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

    if answer_is_numeric:
        # 숫자 정답 → 알파벳 변환
        parts = [a.strip() for a in RE_ANSWER_SPLIT.split(answer_raw) if a.strip()]
        answer_letters = []
        for part in parts:
            for ch in part:
                if ch in NUM_TO_LETTER:
                    answer_letters.append(NUM_TO_LETTER[ch])
    else:
        # 알파벳 정답 파싱
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
