import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAccountDrafts, MAX_ACCOUNT_DRAFT_BYTES } from '../src/scripts/account-draft-data.mjs';
import { accountDraftStore } from '../src/lib/account-drafts.mjs';
import { handleAccountDraftRequest } from '../src/lib/account-draft-http.mjs';

const alice = { github_id: '101', status: 'approved' };
const bob = { github_id: '202', status: 'approved' };
const project = { id: 'github-1', name: 'Tool', description: '', url: 'https://example.com/tool', source: 'https://github.com/test/tool' };
const contribution = { id: 'story-1', name: 'Story', handle: '@test', repository: 'test/tool', story: 'Prepared a fix.', evidence: 'https://github.com/test/tool/pull/1' };
const empty = () => ({ projects: [], showcase: [], contributionDrafts: [] });
const drafts = () => ({ projects: [{ ...project }], showcase: ['github-1'], contributionDrafts: [{ ...contribution }] });
const status = expected => error => error.status === expected;

// The fake serializes and commits transactions atomically, like the database boundary.
function database() {
  const records = new Map([['sidework_accounts/101', { ...alice }], ['sidework_accounts/202', { ...bob }]]);
  let queue = Promise.resolve();
  return {
    records,
    collection: name => ({ doc: id => ({ path: `${name}/${id}` }) }),
    runTransaction(action) {
      const run = queue.then(async () => {
        const changes = new Map();
        const result = await action({
          get: async ref => ({ exists: records.has(ref.path), data: () => structuredClone(records.get(ref.path)) }),
          set: (ref, value) => changes.set(ref.path, structuredClone(value)),
        });
        for (const [key, value] of changes) records.set(key, value);
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}

test('draft validation retains authored fields, blank import descriptions and selected order', () => {
  const input = drafts();
  input.projects[0] = { ...project, id: 'local:existing_id.1', whyBuilt: 'A reason.', learned: 'A result.', category: 'utilities', features: ['Search'], stage: 'building', local: true };
  input.showcase = ['local:existing_id.1'];
  const result = validateAccountDrafts(input);
  assert.equal(result.projects[0].description, '');
  assert.equal(result.projects[0].whyBuilt, 'A reason.');
  assert.equal(result.projects[0].learned, 'A result.');
  assert.deepEqual(result.projects[0].features, ['Search']);
  assert.deepEqual(result.showcase, ['local:existing_id.1']);
  assert.deepEqual(result.contributionDrafts, [contribution]);
  assert.notEqual(result.projects, input.projects);
});

test('draft validation rejects malformed, truncated, unsafe or duplicate records', () => {
  const bad = [null, [], {}, { ...empty(), plan: {} }, { ...empty(), github_id: '202' },
    { ...empty(), projects: [null] }, { ...empty(), projects: [project, project] },
    { ...drafts(), showcase: ['missing'] }, { ...drafts(), showcase: ['github-1', 'github-1'] },
    { ...drafts(), contributionDrafts: [contribution, contribution] },
    { ...drafts(), contributionDrafts: [{ ...contribution, status: 'merged' }] },
    { ...drafts(), contributionDrafts: [{ ...contribution, story: 'a'.repeat(2001) }] },
    { ...drafts(), contributionDrafts: [{ ...contribution, evidence: 'https://github.com/other/tool/pull/1' }] },
  ];
  for (const extra of [{ id: '' }, { id: 'a'.repeat(101) }, { name: 'a'.repeat(61) }, { description: 'a'.repeat(281) }, { whyBuilt: 'a'.repeat(1201) }, { url: 'javascript:alert(1)' }, { source: 'https://user:pass@example.com' }, { image: 'http://example.com/image.png' }, { stage: 'merged' }, { local: 'true' }, { features: ['same', 'same'] }, { category: 'invalid' }, { unknown: 'dropped' }]) bad.push({ ...drafts(), projects: [{ ...project, ...extra }] });
  bad.push({ ...drafts(), projects: [project, { ...project, id: 'other' }] });
  for (const input of bad) assert.throws(() => validateAccountDrafts(input), status(400));
});

test('draft validation rejects count and byte limits instead of dropping data', () => {
  assert.throws(() => validateAccountDrafts({ ...empty(), projects: Array(5001).fill(project) }), status(400));
  assert.throws(() => validateAccountDrafts({ ...empty(), contributionDrafts: Array(21).fill(contribution) }), status(400));
  assert.throws(() => validateAccountDrafts({ ...empty(), showcase: Array(7).fill('x') }), status(400));
  const projects = Array.from({ length: 300 }, (_, i) => ({ ...project, id: `project-${i}`, source: `https://github.com/test/tool-${i}`, whyBuilt: 'é'.repeat(1200) }));
  assert.throws(() => validateAccountDrafts({ ...empty(), projects }), status(413));
});

test('store keeps two accounts separate and persists the complete private record', async () => {
  const db = database(), store = accountDraftStore({}, db);
  assert.deepEqual(await store.read(alice), { revision: 0, updatedAt: null, drafts: empty() });
  const saved = await store.save(alice, { revision: 0, drafts: drafts() });
  assert.equal(saved.revision, 1);
  assert.ok(Number.isFinite(Date.parse(saved.updatedAt)));
  assert.deepEqual(await store.read(alice), saved);
  assert.deepEqual(await store.read(bob), { revision: 0, updatedAt: null, drafts: empty() });
  await store.save(bob, { revision: 0, drafts: empty() });
  assert.deepEqual(await store.read(alice), saved);
  assert.equal(db.records.get('sidework_drafts/101').drafts.projects[0].name, 'Tool');
});

test('store rejects invalid identity and rechecks current approval and identity on reads and writes', async () => {
  const db = database(), store = accountDraftStore({}, db);
  for (const account of [null, { ...alice, github_id: '../202' }, { ...alice, github_id: 101 }]) {
    await assert.rejects(store.read(account), status(401));
    await assert.rejects(store.save(account, { revision: 0, drafts: empty() }), status(401));
  }
  for (const record of [null, { ...alice, status: 'waiting' }, { ...alice, github_id: '202' }]) {
    if (record) db.records.set('sidework_accounts/101', record); else db.records.delete('sidework_accounts/101');
    await assert.rejects(store.read(alice), status(403));
    await assert.rejects(store.save(alice, { revision: 0, drafts: empty() }), status(403));
    assert.equal(db.records.has('sidework_drafts/101'), false);
  }
});

test('store rejects stale and simultaneous revisions without overwriting a saved record', async () => {
  const db = database(), store = accountDraftStore({}, db);
  const results = await Promise.allSettled([
    store.save(alice, { revision: 0, drafts: drafts() }),
    store.save(alice, { revision: 0, drafts: empty() }),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].reason.status, 409);
  const saved = await store.read(alice);
  assert.equal(saved.drafts.projects[0].name, 'Tool');
  await assert.rejects(store.save(alice, { revision: 0, drafts: empty() }), status(409));
  assert.deepEqual(await store.read(alice), saved);
  assert.equal((await store.save(alice, { revision: 1, drafts: empty() })).revision, 2);
});

test('store rejects client identity, malformed revisions and corrupt stored state', async () => {
  const db = database(), store = accountDraftStore({}, db);
  for (const payload of [null, { revision: -1, drafts: empty() }, { revision: 0.1, drafts: empty() }, { revision: '0', drafts: empty() }, { revision: 0, drafts: empty(), github_id: '202' }]) await assert.rejects(store.save(alice, payload), status(400));
  db.records.set('sidework_drafts/101', { revision: 1, updatedAt: 'invalid', drafts: empty() });
  await assert.rejects(store.read(alice), status(503));
  await assert.rejects(store.save(alice, { revision: 1, drafts: empty() }), status(503));
});

function request(method = 'GET', body, extra = {}) {
  return new Request('https://sidework.test/api/account/drafts', { method, headers: { origin: 'https://sidework.test', 'content-type': 'application/json', 'x-sidework-account': '101', ...extra }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
}

test('HTTP handler requires an approved account and denies legacy or bearer-only requests', async () => {
  const store = accountDraftStore({}, database());
  for (const [account, code] of [[null, 401], [{ ...alice, status: 'waiting' }, 403], [{ ...alice, github_id: 'bad' }, 401]]) {
    const response = await handleAccountDraftRequest(request('GET', undefined, { authorization: 'Bearer token', cookie: 'legacy=token' }), account, () => store);
    assert.equal(response.status, code);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});

test('HTTP handler reads and writes private JSON and returns conflict and storage errors', async () => {
  const store = accountDraftStore({}, database());
  const get = await handleAccountDraftRequest(request(), alice, () => store);
  assert.equal(get.status, 200);
  assert.equal(get.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await get.json(), { revision: 0, updatedAt: null, drafts: empty() });
  const put = () => handleAccountDraftRequest(request('PUT', { revision: 0, drafts: drafts() }), alice, () => store);
  assert.equal((await put()).status, 200);
  assert.equal((await put()).status, 409);
  const unavailable = await handleAccountDraftRequest(request(), alice, () => { throw new Error('secret database details'); });
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /secret/);
});

test('HTTP handler rejects cross-origin writes, non-JSON, invalid JSON and ownership fields', async () => {
  const store = accountDraftStore({}, database());
  const cases = [
    [request('PUT', {}, { origin: 'https://evil.test' }), 403],
    [request('PUT', {}, { origin: 'null' }), 403],
    [request('PUT', {}, { 'content-type': 'text/plain' }), 415],
    [request('PUT', {}, { 'content-type': 'application/json-not-really' }), 415],
    [request('PUT', '{'), 400],
    [request('PUT', { revision: 0, drafts: empty(), accountId: '202' }), 400],
    [request('DELETE'), 405],
  ];
  for (const [input, code] of cases) assert.equal((await handleAccountDraftRequest(input, alice, () => store)).status, code);
  assert.equal((await store.read(alice)).revision, 0);
});

test('HTTP handler bounds streamed UTF-8 bytes even when content-length is false or absent', async () => {
  const store = accountDraftStore({}, database());
  for (const headers of [{}, { 'content-length': '1' }, { 'content-length': String(MAX_ACCOUNT_DRAFT_BYTES + 1) }]) {
    const response = await handleAccountDraftRequest(request('PUT', ' '.repeat(MAX_ACCOUNT_DRAFT_BYTES + 1), headers), alice, () => store);
    assert.equal(response.status, 413);
  }
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(400000)); }, cancel() { cancelled = true; } });
  const input = new Request('https://sidework.test/api/account/drafts', { method: 'PUT', headers: { origin: 'https://sidework.test', 'content-type': 'application/json', 'x-sidework-account': '101' }, body: stream, duplex: 'half' });
  assert.equal((await handleAccountDraftRequest(input, alice, () => store)).status, 413);
  assert.equal(cancelled, true);
  assert.equal((await store.read(alice)).revision, 0);
});


test('HTTP handler rejects an old tab after the browser signs into a different account', async () => {
  const store = accountDraftStore({}, database());
  for (const input of [request(), request('PUT', { revision: 0, drafts: drafts() })]) {
    assert.equal((await handleAccountDraftRequest(input, bob, () => store)).status, 403);
  }
  const missing = request();
  missing.headers.delete('x-sidework-account');
  assert.equal((await handleAccountDraftRequest(missing, alice, () => store)).status, 403);
  assert.equal((await store.read(bob)).revision, 0);
});

test('HTTP handler rejects arrays and objects in project category and software type', async () => {
  const store = accountDraftStore({}, database());
  for (const [field, values] of [['category', [['utilities'], [], {}]], ['softwareType', [['web-app'], [], {}]]]) {
    for (const value of values) {
      const payload = drafts();
      payload.projects[0][field] = value;
      const response = await handleAccountDraftRequest(request('PUT', { revision: 0, drafts: payload }), alice, () => store);
      assert.equal(response.status, 400, `${field}: ${JSON.stringify(value)}`);
      assert.equal((await store.read(alice)).revision, 0);
    }
  }
});

test('store rejects URLs that exceed the size limit after encoding without changing saved drafts', async () => {
  const store = accountDraftStore({}, database());
  const saved = await store.save(alice, { revision: 0, drafts: drafts() });
  const candidates = ['url', 'source', 'image'].map(field => {
    const payload = drafts();
    payload.projects[0][field] = `https://example.com/${'é'.repeat(500)}`;
    return payload;
  });
  const payload = drafts();
  payload.contributionDrafts[0].evidence += `?context=${'é'.repeat(500)}`;
  candidates.push(payload);
  for (const candidate of candidates) {
    await assert.rejects(store.save(alice, { revision: 1, drafts: candidate }), status(400));
    assert.deepEqual(await store.read(alice), saved);
  }
});

test('accepted Unicode URLs remain valid after encoding and can be read from storage', async () => {
  const payload = drafts();
  payload.projects[0] = { ...project, url: 'https://example.com/café', source: 'https://example.com/source/é', image: 'https://example.com/image/é.png', category: 'utilities', softwareType: 'web-app' };
  payload.contributionDrafts[0].evidence += '?context=café';
  const canonical = validateAccountDrafts(payload);
  assert.equal(canonical.projects[0].url, 'https://example.com/caf%C3%A9');
  assert.equal(canonical.contributionDrafts[0].evidence, 'https://github.com/test/tool/pull/1?context=caf%C3%A9');
  assert.deepEqual(validateAccountDrafts(canonical), canonical);
  const store = accountDraftStore({}, database());
  const saved = await store.save(alice, { revision: 0, drafts: payload });
  assert.deepEqual(await store.read(alice), saved);
});
