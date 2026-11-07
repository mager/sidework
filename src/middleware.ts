import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, configuration, validSession, requiresInvite } from './lib/invite.mjs';
import { ACCOUNT_COOKIE, authConfiguration, readAccountSession, accountAccess } from './lib/github-auth.mjs';
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
        if (path !== '/mager') response = new Response('Account access is temporarily unavailable. Please try again.', {status:503});
      }
    }
    context.locals.hasAccess = accountAccess(context.locals.account, !claims && validSession(context.cookies.get(COOKIE_NAME)?.value, configuration()));
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
