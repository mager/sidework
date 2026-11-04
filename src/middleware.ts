import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, configuration, validSession, requiresInvite } from './lib/invite.mjs';
export const onRequest = defineMiddleware(async (context, next) => {
  // The MCP endpoint enforces its own scoped bearer token, never a browser cookie.
  const agentEndpoint = context.url.pathname.replace(/\/+$/, '') === '/api/mcp';
  if (!agentEndpoint && requiresInvite(context.url.pathname) && !validSession(context.cookies.get(COOKIE_NAME)?.value, configuration())) {
    return new Response(null, { status: 303, headers: { Location: `/invite/?next=${encodeURIComponent(context.url.pathname + context.url.search)}`, 'Cache-Control': 'private, no-store' } });
  }
  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
});
