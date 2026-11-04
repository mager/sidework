import type { APIRoute } from 'astro';
import { COOKIE_NAME, configuration } from '../../lib/invite.mjs';
import { issueAgentToken } from '../../lib/agent-auth.mjs';

export const POST: APIRoute = async ({ request, url, cookies }) => {
  if (request.headers.get('origin') !== url.origin) return Response.json({ error: 'Reload Sidework and try again.' }, { status: 403 });
  try {
    return Response.json(issueAgentToken(cookies.get(COOKIE_NAME)?.value, configuration(), url.origin));
  } catch { return Response.json({ error: 'Your invite session ended. Sign in again.' }, { status: 401 }); }
};
