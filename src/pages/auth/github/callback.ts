import type { APIRoute } from 'astro';
import { authConfiguration, readOauthState, githubIdentity, createAccountSession, ACCOUNT_COOKIE, ACCOUNT_SECONDS, OAUTH_COOKIE } from '../../../lib/github-auth.mjs';
import { accountStore } from '../../../lib/accounts.mjs';
export const GET: APIRoute = async ({url, cookies, redirect}) => {
  const config = authConfiguration();
  const flow = readOauthState(cookies.get(OAUTH_COOKIE)?.value, url.searchParams.get('state'), config);
  cookies.delete(OAUTH_COOKIE, {path:'/auth/github/'});
  if (!config.ready || config.origin !== url.origin) return redirect('/signup/?error=unavailable',303);
  if (!flow) return redirect('/signup/?error=expired',303);
  if (url.searchParams.has('error')) return redirect('/signup/?error=cancelled',303);
  const code = url.searchParams.get('code');
  if (!code || code.length > 512) return redirect('/signup/?error=retry',303);
  try {
    const identity = await githubIdentity(code, flow.verifier, config);
    const account = await accountStore(config).save(identity, flow.updates);
    cookies.set(ACCOUNT_COOKIE, createAccountSession(account.github_id, config), {httpOnly:true, secure:url.protocol === 'https:', sameSite:'lax', path:'/', maxAge:ACCOUNT_SECONDS});
    return redirect(account.status === 'approved' ? '/friends/' : '/waiting/',303);
  } catch (error) {
    return redirect(`/signup/?error=${error instanceof Error && error.message === 'verified-email-required' ? 'email' : 'retry'}`,303);
  }
};
