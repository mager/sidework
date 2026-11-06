import type { APIRoute } from 'astro';
import { COOKIE_NAME, configuration } from '../../lib/invite.mjs';
import { issueAgentToken, issueAccountAgentToken } from '../../lib/agent-auth.mjs';
import { ACCOUNT_COOKIE, authConfiguration, readAccountSession } from '../../lib/github-auth.mjs';

export const POST: APIRoute = async ({ request, url, cookies, locals }) => {
  if (request.headers.get('origin') !== url.origin) return Response.json({ error: 'Reload Sidework and try again.' }, { status: 403 });
  try {
    if (locals.account) {
      const session = readAccountSession(cookies.get(ACCOUNT_COOKIE)?.value, authConfiguration());
      return Response.json(issueAccountAgentToken(session, locals.account, configuration(), url.origin));
    }
    return Response.json(issueAgentToken(cookies.get(COOKIE_NAME)?.value, configuration(), url.origin));
  } catch { return Response.json({ error: 'Your access session ended. Sign in again.' }, { status: 401 }); }
};
