import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, configuration, validSession, requiresInvite } from './lib/invite.mjs';
import { ACCOUNT_COOKIE, ACCOUNT_SECONDS, createAccountSession, authConfiguration, readAccountSession, accountAccess } from './lib/github-auth.mjs';
import { accountStore } from './lib/accounts.mjs';
import { adminRequest } from './lib/admin-middleware';
export const onRequest = defineMiddleware(async (context, next) => {
  if (process.env.SIDEWORK_SITE === 'admin') {
    const response = await adminRequest(context, next);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Referrer-Policy', context.url.pathname.startsWith('/auth/admin/callback') ? 'no-referrer' : 'same-origin');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }
  const path = context.url.pathname.replace(/\/+$/, '') || '/';
  const agentEndpoint = path === '/api/mcp';
  const draftEndpoint = path === '/api/account/drafts';
  const publicRoute = !requiresInvite(path) || path === '/admin/connect';
  const waitingRoute = ['/waiting', '/api/account/updates', '/api/signout'].includes(path);
  let response: Response | undefined;
  if (!agentEndpoint && path !== '/api/signout') {
    const config = authConfiguration();
    const claims = config.origin === context.url.origin && readAccountSession(context.cookies.get(ACCOUNT_COOKIE)?.value, config);
    context.locals.account = null;
    if (claims) {
      try { context.locals.account = await accountStore(config).find(claims.sub); }
      catch {
        // The public snapshot must not depend on account storage availability.
        if (path !== '/mager') response = draftEndpoint ? Response.json({error:'Account access is temporarily unavailable. Please try again.'},{status:503}) : new Response('Account access is temporarily unavailable. Please try again.', {status:503});
      }
    }
    // Refresh only a still-valid, database-backed identity; expiry still requires sign-in.
    if (!response && claims && ['waiting','approved'].includes(context.locals.account?.status) && claims.exp - Math.floor(Date.now()/1000) < ACCOUNT_SECONDS/2) {
      context.cookies.set(ACCOUNT_COOKIE,createAccountSession(context.locals.account.github_id,config),{httpOnly:true,secure:context.url.protocol==='https:',sameSite:'lax',path:'/',maxAge:ACCOUNT_SECONDS});
    }
    context.locals.hasAccess = accountAccess(context.locals.account, !claims && validSession(context.cookies.get(COOKIE_NAME)?.value, configuration()));
    if (!response && draftEndpoint && context.locals.account?.status !== 'approved') response = Response.json({error:context.locals.account ? 'This account is not approved for draft tools.' : 'Sign in again to use account drafts.'},{status:context.locals.account ? 403 : 401});
    if (!response && !publicRoute && !context.locals.hasAccess && !(waitingRoute && context.locals.account)) {
      response = new Response(null, {status:303, headers:{Location:context.locals.account ? '/waiting/' : '/signup/'}});
    }
  }
  response ||= await next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Referrer-Policy', path === '/auth/github/callback' ? 'no-referrer' : 'same-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
});
