import type { APIRoute } from 'astro';
import { authConfiguration } from '../../../lib/github-auth.mjs';
import { handleFavoriteRequest } from '../../../lib/showcase-http.mjs';
import { showcaseStore } from '../../../lib/showcases.mjs';

export const ALL: APIRoute = ({ request, locals }) => handleFavoriteRequest(
  request, locals.account, () => showcaseStore(authConfiguration()),
);
