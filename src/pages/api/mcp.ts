import type { APIRoute } from 'astro';
import { projects } from '../../data/projects';
import { contributions, opportunities } from '../../data/sidework';
import { configuration } from '../../lib/invite.mjs';
import { createAgentServer } from '../../lib/agent-server.mjs';
import { handleAgentRequest } from '../../lib/agent-http.mjs';
import { accountStore } from '../../lib/accounts.mjs';
import { authConfiguration } from '../../lib/github-auth.mjs';

export const ALL: APIRoute = ({ request, url }) => handleAgentRequest(request, {
  ...configuration(), findAccount: (id:string) => accountStore(authConfiguration()).find(id),
}, (identity) => createAgentServer({ projects, contributions, opportunities, origin: url.origin, identity }));
