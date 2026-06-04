// Initiate GitHub OAuth flow
import { respErr } from '@/shared/lib/resp';
import { siteConfig } from '@/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (provider !== 'github') {
    return respErr('Unsupported provider', 400);
  }

  const clientId = siteConfig.github_client_id;
  const redirectUri = `${siteConfig.app_url}/api/auth/callback/github`;
  const scope = 'user:email';

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  return new Response(null, {
    status: 302,
    headers: { Location: githubAuthUrl },
  });
}
