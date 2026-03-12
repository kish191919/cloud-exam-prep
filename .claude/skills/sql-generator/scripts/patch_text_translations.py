#!/usr/bin/env python3
"""
patch_text_translations.py — text_pt / text_es 번역 백필 도구

잘못된 언어로 저장된 text_pt / text_es 필드를 감지하고
Claude Sonnet API로 올바른 번역을 생성하여 Supabase에 PATCH한다.

감지 기준:
  - text_pt에 한글(가-힣)이 포함됨 → 한국어가 저장된 것 → Portuguese로 재번역
  - text_pt == text_en (영어 복사) → Portuguese로 재번역
  - text_es == text_en (영어 복사) → Spanish로 재번역

사용법:
  python3 patch_text_translations.py --exam-id aws-aif-c01
  python3 patch_text_translations.py --exam-id aws-aif-c01 --ids awsaifc01-q106,awsaifc01-q107
  python3 patch_text_translations.py --exam-id aws-aif-c01 --dry-run
"""

import json
import argparse
import re
import sys
import ssl
import urllib.request
import urllib.error
from pathlib import Path


# ─── SSL ────────────────────────────────────────────────────────────────────

def _ssl_context():
    ctx = ssl.create_default_context()
    for ca_path in ('/etc/ssl/cert.pem', '/usr/local/etc/openssl/cert.pem'):
        if Path(ca_path).exists():
            ctx.load_verify_locations(cafile=ca_path)
            break
    return ctx


# ─── ENV ────────────────────────────────────────────────────────────────────

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


# ─── Supabase REST ──────────────────────────────────────────────────────────

def supabase_get(url, key, table, params=''):
    endpoint = f"{url}/rest/v1/{table}"
    if params:
        endpoint = f"{endpoint}?{params}"
    req = urllib.request.Request(
        endpoint, method='GET',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Range': '0-9999',
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
        endpoint, data=data, method='PATCH',
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


# ─── Language Detection ─────────────────────────────────────────────────────

def has_korean(text):
    return bool(re.search(r'[\uAC00-\uD7A3]', text or ''))

def is_wrong_pt(text_pt, text_en):
    """text_pt가 한국어이거나 영어 원문 복사인 경우 True"""
    if not text_pt:
        return True
    if has_korean(text_pt):
        return True
    if text_en and text_pt.strip() == text_en.strip():
        return True
    return False

def is_wrong_es(text_es, text_en):
    """text_es가 한국어이거나 영어 원문 복사인 경우 True"""
    if not text_es:
        return True
    if has_korean(text_es):
        return True
    if text_en and text_es.strip() == text_en.strip():
        return True
    return False


# ─── Claude API Translation ─────────────────────────────────────────────────

def translate_with_claude(api_key, korean_text, target_lang):
    """
    한국어 AWS 시험 문제 텍스트를 target_lang으로 번역한다.
    target_lang: 'pt' (브라질 포르투갈어) 또는 'es' (라틴아메리카 스페인어)
    \n\n 서식 보존, AWS 서비스명 원문 유지.
    """
    import urllib.request
    import json

    lang_desc = {
        'pt': 'Brazilian Portuguese (Português do Brasil)',
        'es': 'Latin American Spanish (Español latinoamericano)',
    }[target_lang]

    question_pattern = {
        'pt': 'Qual [serviço/abordagem] MELHOR atende / É MAIS adequado',
        'es': '¿Qué [servicio/enfoque] MEJOR cumple / es MÁS adecuado',
    }[target_lang]

    prompt = f"""Translate the following AWS exam question from Korean to {lang_desc}.

Rules:
1. PRESERVE all AWS service names exactly (Amazon Bedrock, Amazon SageMaker, AWS Lambda, etc.)
2. Use official AWS exam style: question sentences use MELHOR/MÁS ADECUADO/MAIS/MEJOR in capitals
3. PRESERVE the \\n\\n formatting exactly as-is
4. Do NOT add any preamble, explanation, or extra text — output ONLY the translated text
5. The last sentence (ending with ?) MUST be translated naturally into {lang_desc}
6. Pattern for question sentences: {question_pattern}

Korean text to translate:
{korean_text}

Output only the translated text:"""

    body = json.dumps({
        "model": "claude-sonnet-4-6",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}]
    }, ensure_ascii=False).encode('utf-8')

    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=body,
        method='POST',
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        }
    )
    try:
        ctx = _ssl_context()
        with urllib.request.urlopen(req, context=ctx) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result['content'][0]['text'].strip()
    except urllib.error.HTTPError as e:
        print(f"  [Claude API Error] {e.code}: {e.read().decode('utf-8')[:200]}")
        return None


# ─── Main ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Patch text_pt / text_es translation errors')
    parser.add_argument('--exam-id', required=True, help='e.g. aws-aif-c01')
    parser.add_argument('--ids', help='Comma-separated IDs to patch (optional, auto-detect if omitted)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be patched without writing')
    args = parser.parse_args()

    # Load env
    env_path = Path(__file__).parent.parent.parent.parent.parent / '.env'
    if not env_path.exists():
        env_path = Path('.env')
    env = load_env(env_path)

    supabase_url = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL', '')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')
    anthropic_key = env.get('ANTHROPIC_API_KEY', '')

    if not supabase_url or not supabase_key:
        print('[ERROR] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not found in .env')
        sys.exit(1)
    if not anthropic_key:
        print('[ERROR] ANTHROPIC_API_KEY not found in .env')
        sys.exit(1)

    # Fetch questions
    if args.ids:
        id_list = [i.strip() for i in args.ids.split(',')]
        ids_param = ','.join(f'"{i}"' for i in id_list)
        params = f'id=in.({",".join(id_list)})&select=id,text,text_en,text_pt,text_es'
    else:
        params = f'exam_id=eq.{args.exam_id}&select=id,text,text_en,text_pt,text_es'

    print(f'Fetching questions for exam_id={args.exam_id}...')
    status, data = supabase_get(supabase_url, supabase_key, 'questions', params)
    if status != 200 or not isinstance(data, list):
        print(f'[ERROR] Failed to fetch questions: {status} {str(data)[:200]}')
        sys.exit(1)

    print(f'Fetched {len(data)} questions.')

    # Filter questions needing patch
    to_patch = []
    for q in data:
        needs_pt = is_wrong_pt(q.get('text_pt'), q.get('text_en'))
        needs_es = is_wrong_es(q.get('text_es'), q.get('text_en'))
        if needs_pt or needs_es:
            to_patch.append({
                'id': q['id'],
                'text': q.get('text', ''),
                'text_en': q.get('text_en', ''),
                'needs_pt': needs_pt,
                'needs_es': needs_es,
            })

    print(f'\nQuestions needing patch: {len(to_patch)}')
    if not to_patch:
        print('Nothing to patch.')
        return

    # Show what will be patched
    for q in to_patch:
        flags = []
        if q['needs_pt']:
            flags.append('text_pt')
        if q['needs_es']:
            flags.append('text_es')
        print(f"  {q['id']}: {', '.join(flags)}")

    if args.dry_run:
        print('\n[DRY RUN] No changes written.')
        return

    # Patch each question
    print()
    patched = 0
    failed = 0

    for q in to_patch:
        qid = q['id']
        patch_body = {}

        if q['needs_pt']:
            print(f"  Translating {qid} → pt ...", end=' ', flush=True)
            translated = translate_with_claude(anthropic_key, q['text'], 'pt')
            if translated:
                patch_body['text_pt'] = translated
                print('OK')
            else:
                print('FAIL')
                failed += 1

        if q['needs_es']:
            print(f"  Translating {qid} → es ...", end=' ', flush=True)
            translated = translate_with_claude(anthropic_key, q['text'], 'es')
            if translated:
                patch_body['text_es'] = translated
                print('OK')
            else:
                print('FAIL')
                failed += 1

        if patch_body:
            status, resp = supabase_patch(
                supabase_url, supabase_key,
                'questions', f'id=eq.{qid}',
                patch_body
            )
            if status in (200, 204):
                print(f"  [PATCHED] {qid} ({', '.join(patch_body.keys())})")
                patched += 1
            else:
                print(f"  [DB FAIL] {qid}: {status} {resp[:100]}")
                failed += 1

    print(f'\n━━━━━━━━━━━━━━━━━━━━━━━━')
    print(f'PATCHED: {patched} | FAILED: {failed}')


if __name__ == '__main__':
    main()
