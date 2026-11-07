import type { APIRoute } from 'astro';
import { authConfiguration, beginGithubLogin, OAUTH_COOKIE, OAUTH_SECONDS, readForm } from '../../../lib/github-auth.mjs';
import { validAdminChallenge, adminConfiguration } from '../../../lib/admin.mjs';
export const POST: APIRoute = async ({request, url, cookies, redirect}) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid origin', {status:403});
  const config = authConfiguration();
  if (!config.ready || url.origin !== config.origin) return redirect('/signup/?error=unavailable', 303);
  try {
    const form = await readForm(request);
    const admin = {state:form.get('admin_state'),challenge:form.get('admin_challenge')};
    if (form.has('admin_state') && (!validAdminChallenge(admin) || !adminConfiguration().origin)) return new Response('Invalid admin sign-in.',{status:400});
    const flow = beginGithubLogin(config, form.get('updates') === 'on', Date.now(), form.has('admin_state') ? admin : undefined);
    cookies.set(OAUTH_COOKIE, flow.cookie, {httpOnly:true, secure:url.protocol === 'https:', sameSite:'lax', path:'/auth/github/', maxAge:OAUTH_SECONDS});
    return redirect(flow.url, 303);
  } catch { return redirect('/signup/?error=retry',303); }
};
