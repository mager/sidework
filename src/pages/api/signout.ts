import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../lib/invite.mjs';
export const POST: APIRoute = ({ request, url, cookies, redirect }) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid origin', { status:403 });
  cookies.delete(COOKIE_NAME, { path:'/' });
  return redirect('/invite/',303);
};
