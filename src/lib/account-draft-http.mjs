import { AccountDraftError, MAX_ACCOUNT_DRAFT_BYTES } from '../scripts/account-draft-data.mjs';
import { requireDraftAccount, validateDraftWrite } from './account-drafts.mjs';

function response(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store', ...headers } });
}
async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_ACCOUNT_DRAFT_BYTES) throw new AccountDraftError('Request exceeds 700 KB.', 413);
  const reader = request.body?.getReader();
  const chunks = []; let total = 0;
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_ACCOUNT_DRAFT_BYTES) throw new AccountDraftError('Request exceeds 700 KB.', 413);
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
  }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new AccountDraftError('Send valid JSON draft data.'); }
}
export async function handleAccountDraftRequest(request, account, makeStore) {
  try {
    const id = requireDraftAccount(account);
    if (request.headers.get('x-sidework-account') !== id) throw new AccountDraftError('The signed-in account changed. Reload before using account drafts.', 403);
    if (!['GET', 'PUT'].includes(request.method)) return response({ error: 'Use GET or PUT.' }, 405, { Allow: 'GET, PUT' });
    if (request.method === 'GET') return response(await makeStore().read(account));
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new AccountDraftError('Invalid request origin.', 403);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new AccountDraftError('Send application/json.', 415);
    const payload = validateDraftWrite(await readBody(request));
    return response(await makeStore().save(account, payload));
  } catch (error) {
    return error instanceof AccountDraftError
      ? response({ error: error.message }, error.status)
      : response({ error: 'Account draft storage is unavailable. Keep your changes and try again.' }, 503);
  }
}
