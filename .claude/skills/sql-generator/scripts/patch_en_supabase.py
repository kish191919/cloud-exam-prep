#!/usr/bin/env python3
"""
patch_en_supabase.py — Supabase 필드 백필 도구

모드 1 (--fetch): text_en / explanation_en 등 영어 필드가 비어있는 문제·옵션 조회
                   → output/needs_translation.json 저장
모드 2 (--fetch-content): options[].explanation / ref_links 등 콘텐츠 필드 누락 조회
                   → output/needs_content.json 저장
모드 3 (--patch): 번역/생성 완료된 JSON을 Supabase REST API PATCH로 반영

사용법:
  python3 patch_en_supabase.py --fetch [--exam-id aws-aif-c01]
  python3 patch_en_supabase.py --fetch-content [--exam-id aws-aif-c01] [--set-name "세트 2"]
  python3 patch_en_supabase.py --patch --input-file output/translated_questions.json
  python3 patch_en_supabase.py --patch --input-file output/generated_content.json
"""

import json
import argparse
import sys
import ssl
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from collections import defaultdict


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


def _resolve_set_question_ids(supabase_url, supabase_key, exam_id, set_name):
    """세트 이름으로 question_id set 반환. 실패 시 sys.exit(1)."""
    enc_name = urllib.parse.quote(set_name, safe='')
    enc_exam = urllib.parse.quote(exam_id, safe='')
    status, data = supabase_get(
        supabase_url, supabase_key,
        'exam_sets',
        f'exam_id=eq.{enc_exam}&name=eq.{enc_name}&select=id,name',
    )
    if status != 200 or not data:
        print(f'[ERROR] 세트를 찾을 수 없습니다: exam_id={exam_id}, set_name="{set_name}"')
        s2, d2 = supabase_get(
            supabase_url, supabase_key,
            'exam_sets',
            f'exam_id=eq.{enc_exam}&select=id,name,type&order=sort_order.asc',
        )
        if s2 == 200 and d2:
            print(f'\n사용 가능한 세트 목록 (exam_id={exam_id}):')
            for i, s in enumerate(d2, 1):
                print(f'  [{i}] {s["name"]}  ({s["type"]})')
            print('\n--set-name에 위 이름 중 하나를 정확히 입력하세요.')
        sys.exit(1)
    set_uuid = data[0]['id']
    print(f'[FETCH] 세트 확인: {data[0]["name"]} (UUID: {set_uuid})')

    set_question_ids = set()
    esq_offset = 0
    esq_page = 1000
    while True:
        status, data = supabase_get(
            supabase_url, supabase_key,
            'exam_set_questions',
            f'set_id=eq.{set_uuid}&select=question_id&limit={esq_page}&offset={esq_offset}',
        )
        if status != 200:
            print(f'[ERROR] exam_set_questions 조회 실패: {status} {data}')
            sys.exit(1)
        for row in data:
            set_question_ids.add(row['question_id'])
        if len(data) < esq_page:
            break
        esq_offset += esq_page
    print(f'[FETCH] 세트 소속 문제 수: {len(set_question_ids)}개')
    return set_question_ids


def _fetch_questions_and_options(supabase_url, supabase_key, exam_id, set_name,
                                  q_fields, opt_fields):
    """questions + question_options 조회 후 (all_questions, options_by_qid) 반환."""
    if set_name and not exam_id:
        print('[ERROR] --set-name 사용 시 --exam-id도 함께 지정해야 합니다.')
        sys.exit(1)

    scope_parts = []
    if exam_id:
        scope_parts.append(f'exam_id={exam_id}')
    if set_name:
        scope_parts.append(f'set="{set_name}"')
    scope = f'({", ".join(scope_parts)})' if scope_parts else '(전체)'
    print(f'[FETCH] Supabase에서 문제 목록 조회 중 {scope}...')

    set_question_ids = None
    if set_name and exam_id:
        set_question_ids = _resolve_set_question_ids(supabase_url, supabase_key, exam_id, set_name)

    base_params = f'select={q_fields}&order=id.asc'
    if exam_id:
        base_params += f'&exam_id=eq.{urllib.parse.quote(exam_id, safe="")}'

    all_questions = []
    page_size = 1000
    offset = 0
    while True:
        params = f'{base_params}&limit={page_size}&offset={offset}'
        status, data = supabase_get(supabase_url, supabase_key, 'questions', params)
        if status != 200:
            print(f'[ERROR] questions 조회 실패: {status} {data}')
            sys.exit(1)
        if not data:
            break
        all_questions.extend(data)
        if len(data) < page_size:
            break
        offset += page_size

    print(f'[FETCH] 총 {len(all_questions)}개 문제 조회됨')

    if set_question_ids is not None:
        before = len(all_questions)
        all_questions = [q for q in all_questions if q['id'] in set_question_ids]
        print(f'[FETCH] 세트 필터 적용: {before}개 → {len(all_questions)}개')
    if not all_questions:
        print('처리할 문제가 없습니다.')
        return [], {}

    question_ids = [q['id'] for q in all_questions]
    all_options = []
    batch_size = 100
    for i in range(0, len(question_ids), batch_size):
        batch = question_ids[i:i + batch_size]
        ids_joined = ','.join(batch)
        opt_params = (
            f'select={opt_fields}'
            f'&question_id=in.({ids_joined})'
            f'&order=question_id.asc,sort_order.asc'
        )
        status, data = supabase_get(supabase_url, supabase_key, 'question_options', opt_params)
        if status != 200:
            print(f'[ERROR] question_options 조회 실패: {status} {data}')
            sys.exit(1)
        all_options.extend(data)

    options_by_qid = defaultdict(list)
    for opt in all_options:
        options_by_qid[opt['question_id']].append(opt)

    return all_questions, options_by_qid


def fetch_mode(supabase_url, supabase_key, exam_id, output_dir, set_name=None):
    q_fields = 'id,exam_id,text,explanation,key_points,text_en,explanation_en,key_points_en'
    opt_fields = 'question_id,option_id,text,explanation,text_en,explanation_en,sort_order'

    all_questions, options_by_qid = _fetch_questions_and_options(
        supabase_url, supabase_key, exam_id, set_name, q_fields, opt_fields,
    )
    if not all_questions:
        return

    # ── 번역 필요 항목 필터링 ─────────────────────────────────────────────
    needs_list = []
    stats = {
        'q_text': 0,
        'q_explanation': 0,
        'q_key_points': 0,
        'opt_text': 0,
        'opt_explanation': 0,
    }

    for q in all_questions:
        needs_q = {}
        if not q.get('text_en'):
            needs_q['text_en'] = q['text']
            stats['q_text'] += 1
        if not q.get('explanation_en') and q.get('explanation'):
            needs_q['explanation_en'] = q['explanation']
            stats['q_explanation'] += 1
        if not q.get('key_points_en') and q.get('key_points'):
            needs_q['key_points_en'] = q['key_points']
            stats['q_key_points'] += 1

        needs_opts = []
        for opt in options_by_qid.get(q['id'], []):
            needs_opt = {}
            if not opt.get('text_en') and opt.get('text'):
                needs_opt['text_en'] = opt['text']
                stats['opt_text'] += 1
            if not opt.get('explanation_en') and opt.get('explanation'):
                needs_opt['explanation_en'] = opt['explanation']
                stats['opt_explanation'] += 1
            if needs_opt:
                needs_opts.append({'option_id': opt['option_id'], 'needs': needs_opt})

        if needs_q or needs_opts:
            needs_list.append({
                'id': q['id'],
                'exam_id': q['exam_id'],
                'needs': needs_q,
                'options': needs_opts,
            })

    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / 'needs_translation.json'
    out_file.write_text(json.dumps(needs_list, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'\n[결과] 미번역 문제: {len(needs_list)}개')
    print(f'  - 질문 text_en 누락:         {stats["q_text"]}개')
    print(f'  - 질문 explanation_en 누락:   {stats["q_explanation"]}개')
    print(f'  - 질문 key_points_en 누락:    {stats["q_key_points"]}개')
    print(f'  - 옵션 text_en 누락:          {stats["opt_text"]}개 (항목 기준)')
    print(f'  - 옵션 explanation_en 누락:   {stats["opt_explanation"]}개 (항목 기준)')
    print(f'\n저장: {out_file}')


def fetch_content_mode(supabase_url, supabase_key, exam_id, output_dir, set_name=None):
    """보기별 해설(explanation) 및 ref_links 누락 문제 탐지 → output/needs_content.json 저장"""
    q_fields = 'id,exam_id,text,correct_option_id,ref_links'
    opt_fields = 'question_id,option_id,text,explanation,explanation_en,sort_order'

    all_questions, options_by_qid = _fetch_questions_and_options(
        supabase_url, supabase_key, exam_id, set_name, q_fields, opt_fields,
    )
    if not all_questions:
        return

    # ── 콘텐츠 누락 항목 필터링 ──────────────────────────────────────────
    needs_list = []
    stats = {
        'ref_links': 0,
        'opt_explanation': 0,
        'opt_explanation_en': 0,
    }

    for q in all_questions:
        needs_q = {}
        ref = q.get('ref_links')
        if not ref or ref == '[]' or ref == [] or ref == '':
            needs_q['ref_links'] = True
            stats['ref_links'] += 1

        needs_opts = []
        opts = options_by_qid.get(q['id'], [])
        for opt in opts:
            needs_opt = {}
            if not opt.get('explanation'):
                needs_opt['explanation'] = True
                stats['opt_explanation'] += 1
            if not opt.get('explanation_en'):
                needs_opt['explanation_en'] = True
                stats['opt_explanation_en'] += 1
            if needs_opt:
                needs_opts.append({
                    'option_id': opt['option_id'],
                    'text': opt.get('text', ''),
                    'is_correct': opt['option_id'] == q.get('correct_option_id'),
                    'needs': needs_opt,
                })

        if needs_q or needs_opts:
            needs_list.append({
                'id': q['id'],
                'exam_id': q['exam_id'],
                'text': q.get('text', ''),
                'correct_option_id': q.get('correct_option_id', ''),
                'needs': needs_q,
                'options': needs_opts,
            })

    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / 'needs_content.json'
    out_file.write_text(json.dumps(needs_list, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'\n[결과] 콘텐츠 누락 문제: {len(needs_list)}개')
    print(f'  - ref_links 누락:              {stats["ref_links"]}개')
    print(f'  - 옵션 explanation(한) 누락:   {stats["opt_explanation"]}개 (항목 기준)')
    print(f'  - 옵션 explanation_en(영) 누락: {stats["opt_explanation_en"]}개 (항목 기준)')
    print(f'\n저장: {out_file}')


def patch_mode(supabase_url, supabase_key, input_file):
    if not input_file.exists():
        print(f'[ERROR] 입력 파일 없음: {input_file}')
        sys.exit(1)

    translated = json.loads(input_file.read_text(encoding='utf-8'))
    print(f'[PATCH] {len(translated)}개 문제 PATCH 시작...')

    q_success = q_fail = 0
    opt_success = opt_fail = 0

    for item in translated:
        qid = item['id']

        # 질문 레벨 PATCH (존재하는 필드만)
        q_patch = {}
        if item.get('text_en'):
            q_patch['text_en'] = item['text_en']
        if item.get('explanation_en'):
            q_patch['explanation_en'] = item['explanation_en']
        if item.get('key_points_en'):
            q_patch['key_points_en'] = item['key_points_en']
        if item.get('ref_links'):
            ref = item['ref_links']
            if isinstance(ref, str):
                try:
                    q_patch['ref_links'] = json.loads(ref)
                except (json.JSONDecodeError, ValueError):
                    q_patch['ref_links'] = ref
            else:
                q_patch['ref_links'] = ref

        if q_patch:
            status, body = supabase_patch(
                supabase_url, supabase_key,
                'questions',
                f'id=eq.{urllib.parse.quote(qid, safe="")}',
                q_patch,
            )
            if status in (200, 204):
                q_success += 1
                print(f'[OK] {qid} 질문 PATCH')
            else:
                q_fail += 1
                print(f'[FAIL] {qid} 질문 PATCH: {status} {str(body)[:200]}')

        # 옵션 레벨 PATCH
        for opt in item.get('options', []):
            opt_id = opt['option_id']
            opt_patch = {}
            if opt.get('text_en'):
                opt_patch['text_en'] = opt['text_en']
            if opt.get('explanation'):
                opt_patch['explanation'] = opt['explanation']
            if opt.get('explanation_en'):
                opt_patch['explanation_en'] = opt['explanation_en']

            if opt_patch:
                status, body = supabase_patch(
                    supabase_url, supabase_key,
                    'question_options',
                    f'question_id=eq.{urllib.parse.quote(qid, safe="")}&option_id=eq.{urllib.parse.quote(opt_id, safe="")}',
                    opt_patch,
                )
                if status in (200, 204):
                    opt_success += 1
                else:
                    opt_fail += 1
                    print(f'[FAIL] {qid}/{opt_id} 옵션 PATCH: {status} {str(body)[:200]}')

    print(f'\n✅ 패치 완료: 질문 {q_success}개, 옵션 {opt_success}개')
    if q_fail or opt_fail:
        print(f'❌ 실패: 질문 {q_fail}개, 옵션 {opt_fail}개')
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Supabase 필드 백필 도구')
    mode_group = parser.add_mutually_exclusive_group(required=True)
    mode_group.add_argument('--fetch', action='store_true',
                            help='영어 필드 미번역 문제 조회 모드')
    mode_group.add_argument('--fetch-content', action='store_true',
                            help='보기 해설·참고자료 누락 문제 조회 모드')
    mode_group.add_argument('--patch', action='store_true',
                            help='번역/생성 결과 PATCH 모드')
    parser.add_argument('--exam-id',
                        help='특정 exam_id만 처리 (--fetch/--fetch-content 선택사항, 생략 시 전체)')
    parser.add_argument('--set-name',
                        help='특정 exam_set 이름만 처리 (--exam-id 와 함께 사용, 예: "세트 2")')
    parser.add_argument('--input-file', default='output/translated_questions.json',
                        help='번역/생성 결과 JSON 파일 (--patch 시 사용)')
    parser.add_argument('--output-dir', default='output',
                        help='출력 디렉토리 (기본: output)')
    args = parser.parse_args()

    # .env 읽기 (스크립트 위치 기준 프로젝트 루트 탐색)
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parents[3]
    env = load_env(project_root / '.env')

    supabase_url = (env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or ''

    if not supabase_url or not supabase_key:
        print('[ERROR] .env 파일에서 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.')
        sys.exit(1)

    if args.fetch:
        fetch_mode(supabase_url, supabase_key, args.exam_id, Path(args.output_dir), args.set_name)
    elif args.fetch_content:
        fetch_content_mode(supabase_url, supabase_key, args.exam_id, Path(args.output_dir), args.set_name)
    else:
        patch_mode(supabase_url, supabase_key, Path(args.input_file))


if __name__ == '__main__':
    main()
