import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const clientId = process.env.KAKAO_REST_API_KEY;
  if (!clientId) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('KAKAO_REST_API_KEY is not configured');
    return;
  }

  const baseUrl = process.env.APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

  const state = Math.random().toString(36).substring(2, 10);

  const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  kakaoAuthUrl.searchParams.set('response_type', 'code');
  kakaoAuthUrl.searchParams.set('client_id', clientId);
  kakaoAuthUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/kakao/callback`);
  kakaoAuthUrl.searchParams.set('scope', 'profile_nickname');
  kakaoAuthUrl.searchParams.set('state', state);

  res.writeHead(302, { Location: kakaoAuthUrl.toString() });
  res.end();
}
