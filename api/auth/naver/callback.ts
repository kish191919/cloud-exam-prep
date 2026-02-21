import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';
import { URL, URLSearchParams } from 'url';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const naverClientId = process.env.NAVER_CLIENT_ID;
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5173';

  const errorRedirect = (msg: string) => {
    res.writeHead(302, { Location: `${baseUrl}/?error=${encodeURIComponent(msg)}` });
    res.end();
  };

  if (!supabaseUrl || !serviceRoleKey || !naverClientId || !naverClientSecret) {
    return errorRedirect('server_misconfiguration');
  }

  // code 파라미터 추출
  const reqUrl = new URL(req.url ?? '/', baseUrl);
  const code = reqUrl.searchParams.get('code');
  if (!code) {
    return errorRedirect('missing_code');
  }

  try {
    // 1. code → Naver 액세스 토큰 교환
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: naverClientId,
        client_secret: naverClientSecret,
        redirect_uri: `${baseUrl}/api/auth/naver/callback`,
        code,
      }).toString(),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      return errorRedirect('naver_token_failed');
    }

    // 2. Naver 사용자 프로필 조회
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json() as {
      resultcode: string;
      response?: { id: string; email?: string; name?: string };
    };

    if (profileData.resultcode !== '00' || !profileData.response) {
      return errorRedirect('naver_profile_failed');
    }

    const { id: naverId, email, name } = profileData.response;
    // 네이버 이메일은 선택 항목이므로 없을 경우 합성 이메일 사용
    const userEmail = email || `naver_${naverId}@naver.cloudmaster`;

    // 3. Supabase Admin 클라이언트 생성 (서버사이드 전용)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 4. 이메일로 기존 유저 조회
    const { data: existingUserData } = await supabaseAdmin.auth.admin.getUserByEmail(userEmail);
    const existingUser = existingUserData?.user;

    if (!existingUser) {
      // 신규 유저 생성 (이메일 인증 건너뜀)
      await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: name ?? '네이버 사용자',
          provider: 'naver',
          naver_id: naverId,
        },
      });
    } else if (!existingUser.user_metadata?.naver_id) {
      // 기존 이메일 유저에 Naver 메타데이터 추가
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          naver_id: naverId,
          provider: 'naver',
        },
      });
    }

    // 5. 매직링크 생성 (이메일 발송 없이 action_link만 획득)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: { redirectTo: baseUrl },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return errorRedirect('session_creation_failed');
    }

    // 6. 브라우저를 Supabase action_link로 리다이렉트
    //    Supabase가 처리 후 baseUrl로 #access_token=... 포함하여 리다이렉트
    //    Supabase JS 클라이언트가 URL 해시를 자동 감지하여 세션 설정
    res.writeHead(302, { Location: linkData.properties.action_link });
    res.end();
  } catch {
    return errorRedirect('internal_error');
  }
}
