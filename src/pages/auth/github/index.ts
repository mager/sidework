import type { APIRoute } from 'astro';
import { authConfiguration, beginGithubLogin, OAUTH_COOKIE, OAUTH_SECONDS, readForm } from '../../../lib/github-auth.mjs';
export const POST: APIRoute = async ({request, url, cookies, redirect}) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid origin', {status:403});
  const config = authConfiguration();
  if (!config.ready || url.origin !== config.origin) return redirect('/signup/?error=unavailable', 303);
  try {
    const form = await readForm(request);
    const flow = beginGithubLogin(config, form.get('updates') === 'on');
    cookies.set(OAUTH_COOKIE, flow.cookie, {httpOnly:true, secure:url.protocol === 'https:', sameSite:'lax', path:'/auth/github/', maxAge:OAUTH_SECONDS});
    return redirect(flow.url, 303);
  } catch { return redirect('/signup/?error=retry',303); }
};
