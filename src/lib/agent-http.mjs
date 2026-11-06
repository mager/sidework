import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { authorizeAgentRequest } from './agent-auth.mjs';

export async function handleAgentRequest(request, config, makeServer) {
  const denied = await authorizeAgentRequest(request, config);
  if (denied) return Response.json({ error: denied.error }, { status: denied.status, headers: denied.status === 401 ? { 'WWW-Authenticate': 'Bearer realm="sidework"' } : {} });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return Response.json({ error: 'Send application/json.' }, { status: 415 });
  if (Number(request.headers.get('content-length')) > 100000) return Response.json({ error: 'Request exceeds 100 KB.' }, { status: 413 });
  const reader = request.body?.getReader(); let total = 0; const chunks = [];
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.length;
      if (total > 100000) { await reader.cancel(); return Response.json({ error: 'Request exceeds 100 KB.' }, { status: 413 }); }
      chunks.push(Buffer.from(value));
    }
  }
  let parsedBody;
  try { parsedBody = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 }); }
  const server = makeServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request, { parsedBody });
    // JSON mode completes the response before closing the per-request server.
    const body = await response.arrayBuffer();
    return new Response(response.status === 204 ? null : body, { status: response.status, headers: response.headers });
  } finally { await server.close(); }
}
