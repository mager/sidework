import { AccountDraftError } from '../scripts/account-draft-data.mjs';
import { requireDraftAccount } from './account-drafts.mjs';
import { readForm } from './github-auth.mjs';
import { resolvePublicFavorite, validFavoriteId } from './showcases.mjs';

function revision(form, field = 'revision') {
  const value = form.get(field);
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,15})$/.test(value)) throw new AccountDraftError('Reload before trying again.', 409);
  return Number(value);
}

function fields(form, allowed) {
  for (const key of form.keys()) {
    if (!allowed.includes(key) || form.getAll(key).length !== 1) throw new AccountDraftError('Invalid showcase form.');
  }
}

async function sameOriginForm(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new AccountDraftError('Invalid request origin.', 403);
  try { return await readForm(request); }
  catch { throw new AccountDraftError('Invalid showcase form.'); }
}

const json = (value, status = 200, headers = {}) => Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store', ...headers } });

export async function handleFavoriteRequest(request, account, makeStore, resolve = resolvePublicFavorite) {
  try {
    const id = requireDraftAccount(account);
    if (request.headers.get('x-sidework-account') !== id) throw new AccountDraftError('The signed-in account changed. Reload before saving.', 403);
    if (request.method === 'GET') return json(await makeStore().readFavorites(account));
    if (request.method !== 'POST') return json({ error: 'Use GET or POST.' }, 405, { Allow: 'GET, POST' });
    const form = await sameOriginForm(request);
    fields(form, ['favoriteId', 'revision']);
    const favoriteId = form.get('favoriteId');
    if (!validFavoriteId(favoriteId)) throw new AccountDraftError('Choose a GitHub repository.');
    const expected = revision(form);
    const favorite = await resolve(favoriteId);
    return json(await makeStore().changeFavorite(account, { action: 'add', revision: expected, favorite }));
  } catch (error) {
    return error instanceof AccountDraftError ? json({ error: error.message }, error.status)
      : json({ error: 'Favorites are unavailable. Try again.' }, 503);
  }
}

function result(kind, value) {
  return new Response(null, { status: 303, headers: { Location: `/showcase/?${kind}=${value}`, 'Cache-Control': 'private, no-store' } });
}

export async function handleShowcaseSave(request, account, makeStore) {
  try {
    const id = requireDraftAccount(account);
    const form = await sameOriginForm(request);
    if (form.get('account') !== id) throw new AccountDraftError('The signed-in account changed. Reload before saving.', 403);
    const base = ['account', 'action'];
    const action = form.get('action');
    if (action === 'publish') {
      fields(form, [...base, 'project', 'draftRevision', 'favoritesRevision', 'revision', 'handle', 'listed']);
      await makeStore().publish(account, {
        projectId: form.get('project'), handle: form.get('handle'), listed: form.get('listed') === 'on',
        draftRevision: revision(form, 'draftRevision'), favoritesRevision: revision(form, 'favoritesRevision'), revision: revision(form),
      });
      return result('saved', 'published');
    }
    if (action === 'unpublish') {
      fields(form, [...base, 'revision']);
      await makeStore().unpublish(account, { revision: revision(form) });
      return result('saved', 'unpublished');
    }
    if (action === 'note' || action === 'remove') {
      fields(form, [...base, 'favoriteId', 'favoritesRevision', 'note']);
      const favoriteId = form.get('favoriteId');
      if (!validFavoriteId(favoriteId)) throw new AccountDraftError('Choose a saved favorite repository.');
      await makeStore().changeFavorite(account, { action, favoriteId, note: form.get('note'), revision: revision(form, 'favoritesRevision') });
      return result('saved', 'favorite');
    }
    throw new AccountDraftError('Choose a showcase action.');
  } catch (error) {
    if (!(error instanceof AccountDraftError) || error.status >= 500) return result('error', 'unavailable');
    if (error.status === 409) return result('error', 'changed');
    if (error.status === 401 || error.status === 403) return result('error', 'permission');
    return result('error', 'invalid');
  }
}
