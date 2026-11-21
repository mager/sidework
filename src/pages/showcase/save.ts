import type { APIRoute } from 'astro';
import { authConfiguration } from '../../lib/github-auth.mjs';
import { handleShowcaseSave } from '../../lib/showcase-http.mjs';
import { showcaseStore } from '../../lib/showcases.mjs';

export const POST: APIRoute = ({ request, locals }) => handleShowcaseSave(
  request, locals.account, () => showcaseStore(authConfiguration()),
);
