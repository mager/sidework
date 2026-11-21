import assert from 'node:assert/strict';
import test from 'node:test';
import { buildShowcasePreview, showcaseStore } from '../src/lib/showcases.mjs';
import { handleFavoriteRequest, handleShowcaseSave } from '../src/lib/showcase-http.mjs';

const account = { github_id: '123', status: 'approved', login: 'builder', email: 'private@example.com' };
const project = { id: 'local-tool', name: 'Local tool', description: 'Organize a folder.', url: 'http://localhost:3000/', image: 'https://example.com/tool.png', imageAlt: 'Folder list', whyBuilt: 'Private notes', learned: 'Private lessons' };
const favorite = { id: '345', repository: 'developer/tool', url: 'https://github.com/developer/tool', note: 'Useful documentation.' };

function fixture() {
  const documents = new Map([
    ['sidework_accounts/123', account],
    ['sidework_drafts/123', { revision: 2, updatedAt: '2026-11-21T00:00:00Z', drafts: { projects: [project], showcase: [], contributionDrafts: [] } }],
  ]);
  const snapshot = path => ({ id: path.split('/')[1], exists: documents.has(path), data: () => documents.get(path) });
  const database = {
    collection(name) {
      return {
        doc: id => ({ path: `${name}/${id}`, get: async () => snapshot(`${name}/${id}`) }),
        where: (field, operator, value) => ({ limit: count => ({ get: async () => ({ docs: [...documents]
          .filter(([path, data]) => path.startsWith(`${name}/`) && data[field] === value)
          .slice(0, count).map(([path]) => snapshot(path)) }) }) }),
      };
    },
    async runTransaction(run) {
      const writes = [];
      const result = await run({ get: async ref => snapshot(ref.path), set: (ref, value) => writes.push([ref.path, value]) });
      for (const [path, value] of writes) documents.set(path, value);
      return result;
    },
  };
  return { store: showcaseStore({}, database), documents };
}

test('publishes only the preview fields and requires explicit Explore listing', async () => {
  const { store } = fixture();
  await store.changeFavorite(account, { action: 'add', revision: 0, favorite });
  const model = await store.read(account);
  const preview = buildShowcasePreview(model, project.id);
  assert.equal(preview.project.url, '');
  assert.equal(preview.project.image, project.image);
  assert.deepEqual(preview.favorites, [{ repository: favorite.repository, url: favorite.url, note: favorite.note }]);
  assert.doesNotMatch(JSON.stringify(preview), /Private notes|Private lessons|private@example|localhost/);
  const action = { projectId: project.id, handle: '@builder', draftRevision: 2, favoritesRevision: 1, revision: 0, listed: false };
  const first = await store.publish(account, action);
  assert.deepEqual(await store.explore(), []);
  assert.deepEqual(await store.publicBySlug(first.slug), { ...preview, publishedAt: first.publishedAt });
  const listed = await store.publish(account, { ...action, listed: true, revision: 1 });
  assert.equal(listed.slug, first.slug);
  assert.equal((await store.explore())[0].handle, '@builder');
  await store.unpublish(account, { revision: 2 });
  assert.equal(await store.publicBySlug(first.slug), null);
  assert.deepEqual(await store.explore(), []);
  assert.equal((await store.read(account)).favorites.length, 1);
});

test('stale drafts, favorite changes, and revoked approval stop publication', async () => {
  const { store, documents } = fixture();
  await store.changeFavorite(account, { action: 'add', revision: 0, favorite });
  const action = { projectId: project.id, handle: '@builder', draftRevision: 2, favoritesRevision: 1, revision: 0, listed: true };
  await assert.rejects(store.publish(account, { ...action, draftRevision: 1 }), { status: 409 });
  await store.changeFavorite(account, { action: 'note', revision: 1, favoriteId: favorite.id, note: 'New note' });
  await assert.rejects(store.publish(account, action), { status: 409 });
  await assert.rejects(store.changeFavorite(account, { action: 'remove', revision: 1, favoriteId: favorite.id }), { status: 409 });
  const publication = await store.publish(account, { ...action, favoritesRevision: 2 });
  documents.set('sidework_accounts/123', { ...account, status: 'waiting' });
  assert.equal(await store.publicBySlug(publication.slug), null);
  assert.deepEqual(await store.explore(), []);
  await assert.rejects(store.unpublish(account, { revision: 1 }), { status: 403 });
  await assert.rejects(store.read(null), { status: 401 });
});

test('favorites and publication require the signed-in account and same-origin mutations', async () => {
  const { store } = fixture();
  const origin = 'https://sidework.example';
  const form = (path, data, headers = {}) => new Request(origin + path, {
    method: 'POST', headers: { origin, 'X-Sidework-Account': account.github_id, ...headers }, body: new URLSearchParams(data),
  });
  const add = (request, signedIn = account) => handleFavoriteRequest(request, signedIn, () => store, async id => {
    assert.equal(id, favorite.id);
    return favorite;
  });
  const fields = { favoriteId: favorite.id, revision: '0' };
  assert.equal((await add(form('/api/account/favorites', fields), null)).status, 401);
  assert.equal((await add(form('/api/account/favorites', fields, { 'X-Sidework-Account': '456' }))).status, 403);
  assert.equal((await add(form('/api/account/favorites', fields, { origin: 'https://other.example' }))).status, 403);
  assert.equal((await add(form('/api/account/favorites', fields))).status, 200);
  const publish = { account: '123', action: 'publish', project: project.id, draftRevision: '2', favoritesRevision: '1', revision: '0', handle: '@builder', listed: 'on' };
  const save = (data, headers) => handleShowcaseSave(form('/showcase/save/', data, headers), account, () => store);
  assert.equal((await save({ ...publish, account: '456' })).headers.get('location'), '/showcase/?error=permission');
  assert.equal((await save(publish, { origin: 'https://other.example' })).headers.get('location'), '/showcase/?error=permission');
  assert.equal((await save({ ...publish, project: 'another-account' })).headers.get('location'), '/showcase/?error=invalid');
  assert.deepEqual(await store.explore(), []);
  assert.equal((await save(publish)).headers.get('location'), '/showcase/?saved=published');
  assert.equal((await store.explore()).length, 1);
  const remove = { account: '123', action: 'remove', favoriteId: favorite.id, favoritesRevision: '1', note: 'An unsaved edit.' };
  assert.equal((await save(remove)).headers.get('location'), '/showcase/?saved=favorite');
  assert.deepEqual((await store.read(account)).favorites, []);
  const [listing] = await store.explore();
  assert.equal((await store.publicBySlug(listing.slug)).favorites.length, 1);
});
