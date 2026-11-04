import type { APIRoute } from 'astro';
import { projects } from '../../data/projects';
import { contributions, opportunities } from '../../data/sidework';
import { configuration } from '../../lib/invite.mjs';
import { createAgentServer } from '../../lib/agent-server.mjs';
import { handleAgentRequest } from '../../lib/agent-http.mjs';

export const ALL: APIRoute = ({ request, url }) => handleAgentRequest(request, configuration(), () => createAgentServer({ projects, contributions, opportunities, origin: url.origin }));
