import type { APIRoute } from 'astro';
import { authConfiguration } from '../../../lib/github-auth.mjs';
import { accountDraftStore } from '../../../lib/account-drafts.mjs';
import { handleAccountDraftRequest } from '../../../lib/account-draft-http.mjs';

export const ALL: APIRoute = ({ request, locals }) => handleAccountDraftRequest(
  request, locals.account, () => accountDraftStore(authConfiguration()),
);
