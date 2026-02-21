import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const clientId = process.env.NAVER_CLIENT_ID;
  if (!clientId) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('NAVER_CLIENT_ID is not configured');
    return;
  }

  const baseUrl = process.env.APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

  const state = Math.random().toString(36).substring(2, 10);

  const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
  naverAuthUrl.searchParams.set('response_type', 'code');
  naverAuthUrl.searchParams.set('client_id', clientId);
  naverAuthUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/naver/callback`);
  naverAuthUrl.searchParams.set('state', state);

  res.writeHead(302, { Location: naverAuthUrl.toString() });
  res.end();
}
