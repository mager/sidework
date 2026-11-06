import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../lib/invite.mjs';
import { ACCOUNT_COOKIE, OAUTH_COOKIE } from '../../lib/github-auth.mjs';
export const POST: APIRoute = ({ request, url, cookies, redirect }) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid origin', { status:403 });
  cookies.delete(COOKIE_NAME, { path:'/' });
  cookies.delete(ACCOUNT_COOKIE, { path:'/' });
  cookies.delete(OAUTH_COOKIE, { path:'/auth/github/' });
  return redirect('/signup/',303);
};
