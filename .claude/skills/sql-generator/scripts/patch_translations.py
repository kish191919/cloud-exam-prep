#!/usr/bin/env python3
"""
patch_translations.py — 다국어 번역 누락 필드 자동 패치

번역 필드(_en/_es/_pt/_ja)에 한국어가 들어있거나 null인 경우
Claude API로 재번역 후 Supabase에 PATCH.

사용법:
  python3 patch_translations.py --exam-id aws-aif-c01
  python3 patch_translations.py --exam-id aws-aif-c01 --ids awsaifc01-q1356,awsaifc01-q1357
  python3 patch_translations.py --exam-id aws-aif-c01 --dry-run
"""

import json
import argparse
import sys
import os
import ssl
import urllib.request
import urllib.error
import urllib.parse
import re
from pathlib import Path


# ── 설정 ─────────────────────────────────────────────────────────────────────

CLAUDE_MODEL = 'claude-haiku-4-5-20251001'
CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

LANG_NAMES = {
    'en': 'English (AWS exam style)',
    'pt': 'Brazilian Portuguese',
    'es': 'Latin American Spanish',
}

LANG_SUFFIX = ['en', 'pt', 'es']

Q_TRANSLATE_FIELDS = ['explanation', 'key_points']   # _en/_pt/_es/_ja 접미사 붙여서 사용
OPT_TRANSLATE_FIELDS = ['explanation']


# ── 유틸리티 ──────────────────────────────────────────────────────────────────

def _ssl_context():
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


def is_korean(text: str) -> bool:
    """한글 포함 여부 확인"""
    return bool(re.search(r'[가-힣]', text or ''))


def needs_translation(value) -> bool:
    """번역이 필요한지 판단: null이거나 한글 포함 시 True"""
    if not value:
        return True
    return is_korean(str(value))


def load_env(env_path: Path) -> dict:
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


# ── Supabase API ──────────────────────────────────────────────────────────────

def supabase_get(url, key, table, params=''):
    endpoint = f"{url}/rest/v1/{table}"
    if params:
        endpoint += f"?{params}"
    req = urllib.request.Request(
        endpoint,
        method='GET',
        headers={'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
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


# ── Claude API ────────────────────────────────────────────────────────────────

def call_claude(api_key: str, prompt: str, system: str = '') -> str:
    """Claude API 호출 후 text 반환"""
    body = {
        'model': CLAUDE_MODEL,
        'max_tokens': 4096,
        'messages': [{'role': 'user', 'content': prompt}],
    }
    if system:
        body['system'] = system

    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        CLAUDE_API_URL,
        data=data,
        method='POST',
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(req, context=_ssl_context()) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result['content'][0]['text'].strip()
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8')
        print(f'[ERROR] Claude API 오류: {e.code} {err[:200]}')
        return ''


def translate_fields(api_key: str, korean_fields: dict, question_text_ko: str) -> dict:
    """
    korean_fields: {'explanation': '한국어 해설', 'key_points': '핵심 암기사항'} 등
    question_text_ko: 질문 문맥 (선택적, 번역 품질 향상용)

    반환: {'explanation_en': '...', 'explanation_pt': '...', ..., 'key_points_en': '...', ...}
    """
    if not korean_fields:
        return {}

    # 번역할 텍스트 목록 구성
    fields_list = []
    for field_name, korean_text in korean_fields.items():
        fields_list.append(f'FIELD:{field_name}\n{korean_text}')
    fields_str = '\n\n---\n\n'.join(fields_list)

    prompt = f"""You are translating AWS certification exam content from Korean to 4 languages.

Context (Korean question text for reference):
{question_text_ko[:300]}

Translate each FIELD below into English (AWS exam style), Brazilian Portuguese, Latin American Spanish, and Japanese.

Rules:
- AWS/GCP/Azure service names: keep in original English (e.g., Amazon SageMaker, Amazon Bedrock)
- English: use AWS certification exam style (e.g., "BEST meets these requirements")
- Do NOT include any Korean characters in the output
- For key_points: preserve the "Title\\n• point1\\n• point2" format in each language
- Output ONLY the JSON object, no explanation

Fields to translate:
{fields_str}

Output format (JSON only):
{{
{chr(10).join(f'  "{f}_en": "English translation",{chr(10)}  "{f}_pt": "Portuguese translation",{chr(10)}  "{f}_es": "Spanish translation",{chr(10)}  "{f}_ja": "Japanese translation"' for f in korean_fields.keys())}
}}"""

    system = 'You are a precise multilingual translator for AWS certification exam content. Output only valid JSON.'

    response = call_claude(api_key, prompt, system)
    if not response:
        return {}

    # JSON 파싱
    try:
        # JSON 블록 추출 (```json ... ``` 감싸인 경우 포함)
        match = re.search(r'\{[\s\S]*\}', response)
        if match:
            return json.loads(match.group())
    except (json.JSONDecodeError, ValueError) as e:
        print(f'[WARN] JSON 파싱 실패: {e}\n응답: {response[:200]}')
    return {}


# ── 메인 처리 ─────────────────────────────────────────────────────────────────

def process_questions(supabase_url, supabase_key, api_key, exam_id, ids_filter, dry_run):
    # 1. questions 조회
    q_select_fields = ','.join(
        ['id', 'exam_id', 'text']
        + [f'{f}_{lang}' for f in Q_TRANSLATE_FIELDS for lang in LANG_SUFFIX]
        + Q_TRANSLATE_FIELDS
    )
    params = f'select={q_select_fields}&exam_id=eq.{urllib.parse.quote(exam_id, safe="")}&order=id.asc'

    if ids_filter:
        ids_joined = ','.join(ids_filter)
        params += f'&id=in.({ids_joined})'

    status, questions = supabase_get(supabase_url, supabase_key, 'questions', params)
    if status != 200:
        print(f'[ERROR] questions 조회 실패: {status} {str(questions)[:200]}')
        sys.exit(1)

    print(f'[INFO] {len(questions)}개 질문 조회됨')

    # 2. question_options 조회
    qids = [q['id'] for q in questions]
    opt_select_fields = ','.join(
        ['question_id', 'option_id']
        + [f'{f}_{lang}' for f in OPT_TRANSLATE_FIELDS for lang in LANG_SUFFIX]
        + OPT_TRANSLATE_FIELDS
    )
    options_by_qid = {}
    batch_size = 50
    for i in range(0, len(qids), batch_size):
        batch = qids[i:i + batch_size]
        ids_joined = ','.join(batch)
        opt_params = f'select={opt_select_fields}&question_id=in.({ids_joined})&order=question_id.asc,option_id.asc'
        status, opts = supabase_get(supabase_url, supabase_key, 'question_options', opt_params)
        if status != 200:
            print(f'[ERROR] question_options 조회 실패: {status}')
            continue
        for opt in opts:
            qid = opt['question_id']
            if qid not in options_by_qid:
                options_by_qid[qid] = []
            options_by_qid[qid].append(opt)

    # 3. 번역 필요 항목 처리
    q_patched = q_skipped = q_failed = 0
    opt_patched = opt_failed = 0

    for q in questions:
        qid = q['id']
        question_text_ko = q.get('text', '')

        # 3a. 질문 레벨 번역 필요 필드 탐지
        korean_to_translate = {}
        for field in Q_TRANSLATE_FIELDS:
            ko_val = q.get(field, '')
            if not ko_val:
                continue
            for lang in LANG_SUFFIX:
                lang_val = q.get(f'{field}_{lang}')
                if needs_translation(lang_val):
                    if field not in korean_to_translate:
                        korean_to_translate[field] = ko_val
                    break  # 하나라도 누락이면 이 field 전체 재번역

        if korean_to_translate:
            print(f'[{qid}] 질문 레벨 번역 필요: {list(korean_to_translate.keys())}')
            if not dry_run:
                translations = translate_fields(api_key, korean_to_translate, question_text_ko)
                if translations:
                    # 기존에 정상인 언어는 덮어쓰지 않음
                    patch_body = {}
                    for field in korean_to_translate:
                        for lang in LANG_SUFFIX:
                            key = f'{field}_{lang}'
                            if key in translations and not is_korean(translations[key]):
                                existing = q.get(key)
                                if needs_translation(existing):
                                    patch_body[key] = translations[key]

                    if patch_body:
                        status, resp = supabase_patch(
                            supabase_url, supabase_key,
                            'questions',
                            f'id=eq.{urllib.parse.quote(qid, safe="")}',
                            patch_body,
                        )
                        if status in (200, 204):
                            print(f'  [OK] 질문 PATCH: {list(patch_body.keys())}')
                            q_patched += 1
                        else:
                            print(f'  [FAIL] 질문 PATCH: {status} {str(resp)[:150]}')
                            q_failed += 1
                else:
                    print(f'  [WARN] 번역 결과 없음, 스킵')
                    q_failed += 1
        else:
            q_skipped += 1

        # 3b. 옵션 레벨 번역 필요 필드 탐지
        for opt in options_by_qid.get(qid, []):
            opt_id = opt['option_id']
            opt_korean_to_translate = {}
            for field in OPT_TRANSLATE_FIELDS:
                ko_val = opt.get(field, '')
                if not ko_val:
                    continue
                for lang in LANG_SUFFIX:
                    lang_val = opt.get(f'{field}_{lang}')
                    if needs_translation(lang_val):
                        if field not in opt_korean_to_translate:
                            opt_korean_to_translate[field] = ko_val
                        break

            if opt_korean_to_translate:
                print(f'  [{qid}/{opt_id}] 옵션 번역 필요')
                if not dry_run:
                    translations = translate_fields(api_key, opt_korean_to_translate, question_text_ko)
                    if translations:
                        patch_body = {}
                        for field in opt_korean_to_translate:
                            for lang in LANG_SUFFIX:
                                key = f'{field}_{lang}'
                                if key in translations and not is_korean(translations[key]):
                                    existing = opt.get(key)
                                    if needs_translation(existing):
                                        patch_body[key] = translations[key]

                        if patch_body:
                            status, resp = supabase_patch(
                                supabase_url, supabase_key,
                                'question_options',
                                f'question_id=eq.{urllib.parse.quote(qid, safe="")}&option_id=eq.{urllib.parse.quote(opt_id, safe="")}',
                                patch_body,
                            )
                            if status in (200, 204):
                                opt_patched += 1
                            else:
                                print(f'    [FAIL] 옵션 PATCH: {status} {str(resp)[:150]}')
                                opt_failed += 1
                    else:
                        opt_failed += 1

    print(f'\n{"[DRY-RUN] " if dry_run else ""}✅ 완료')
    print(f'  질문: {q_patched}개 패치 | {q_skipped}개 정상 | {q_failed}개 실패')
    print(f'  옵션: {opt_patched}개 패치 | {opt_failed}개 실패')


def main():
    parser = argparse.ArgumentParser(description='다국어 번역 누락 필드 자동 패치')
    parser.add_argument('--exam-id', required=True, help='대상 exam_id (예: aws-aif-c01)')
    parser.add_argument('--ids', help='특정 question IDs 쉼표 구분 (생략 시 exam 전체)')
    parser.add_argument('--dry-run', action='store_true', help='실제 패치 없이 탐지만')
    args = parser.parse_args()

    # .env 읽기
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parents[3]
    env = load_env(project_root / '.env')

    supabase_url = (env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''
    api_key = os.environ.get('ANTHROPIC_API_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env에서 Supabase 접속 정보를 찾을 수 없습니다.')
        sys.exit(1)
    if not api_key and not args.dry_run:
        print('[ERROR] ANTHROPIC_API_KEY 환경 변수가 없습니다.')
        sys.exit(1)

    ids_filter = [i.strip() for i in args.ids.split(',')] if args.ids else None

    print(f'대상: {args.exam_id}' + (f' / IDs: {ids_filter}' if ids_filter else ' (전체)'))
    if args.dry_run:
        print('[DRY-RUN 모드] 탐지만 수행, 실제 패치 없음')

    process_questions(supabase_url, supabase_key, api_key, args.exam_id, ids_filter, args.dry_run)


if __name__ == '__main__':
    main()
