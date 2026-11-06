import type { APIRoute } from 'astro';
import { authConfiguration, readForm } from '../../../lib/github-auth.mjs';
import { accountStore } from '../../../lib/accounts.mjs';
export const POST: APIRoute = async ({request, url, locals, redirect}) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid origin',{status:403});
  if (!locals.account) return new Response('Sign in again.',{status:401});
  const destination = locals.hasAccess ? '/settings/' : '/waiting/';
  try {
    const form = await readForm(request);
    await accountStore(authConfiguration()).setUpdates(locals.account.github_id, form.get('updates') === 'on');
    return redirect(`${destination}?saved=1`,303);
  } catch { return redirect(`${destination}?error=save`,303); }
};
