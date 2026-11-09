import type { APIRoute } from 'astro';
import { handleAdminAccess } from '../../lib/admin-access.mjs';
import { adminConfiguration } from '../../lib/admin.mjs';
import { accountDatabase } from '../../lib/firestore.mjs';
import { authConfiguration } from '../../lib/github-auth.mjs';

export const POST: APIRoute = context => handleAdminAccess(context, {
  site: process.env.SIDEWORK_SITE,
  config: adminConfiguration(),
  getDatabase: () => accountDatabase(authConfiguration()),
});
