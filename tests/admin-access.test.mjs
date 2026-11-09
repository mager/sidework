import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAdminAccess } from '../src/lib/admin-access.mjs';
import { ADMIN_COOKIE, adminConfiguration, createAdminSession } from '../src/lib/admin.mjs';

const config = adminConfiguration({
  SIDEWORK_ADMIN_ORIGIN: 'https://admin.example.com',
  SIDEWORK_ORIGIN: 'https://example.com',
  SIDEWORK_ADMIN_SESSION_SECRET: 'a test-only secret that is long enough',
  SIDEWORK_OWNER_GITHUB_ID: '1',
});
const owner = { github_id: '1', status: 'approved' };
const applicant = {
  github_id: '2', login: 'test-applicant', email: 'applicant@example.com',
  status: 'waiting', email_updates: true, created_at: '2026-11-01T00:00:00.000Z',
  last_login_at: '2026-11-02T00:00:00.000Z', updates_changed_at: '2026-11-02T00:00:00.000Z',
};
const session = createAdminSession(owner, config);
const approval = 'github_id=2&status=approved&expected_status=waiting';

function setup({ currentOwner = owner, target = applicant, failAudit = false } = {}) {
  const records = new Map([
    ['sidework_accounts/1', currentOwner],
    ['sidework_accounts/2', target],
  ]);
  const database = {
    collection: name => ({ doc: (id = 'event') => `${name}/${id}` }),
    async runTransaction(action) {
      const pending = new Map(records);
      const result = await action({
        get: async ref => ({ exists: !!records.get(ref), data: () => records.get(ref) }),
        update(ref, fields) {
          assert.ok(pending.get(ref));
          pending.set(ref, { ...pending.get(ref), ...fields });
        },
        create(ref, fields) {
          if (failAudit) throw new Error('private database failure');
          assert.equal(pending.has(ref), false);
          pending.set(ref, fields);
        },
      });
      for (const [ref, data] of pending) records.set(ref, data);
      return result;
    },
  };
  return {
    account: () => records.get('sidework_accounts/2'),
    events: () => [...records].filter(([ref]) => ref.startsWith('sidework_access_events/')).map(([, data]) => data),
    submit(body = approval, {
      site = 'admin', origin = config.origin, address = config.origin, cookie = session,
      account = owner, contentType = 'application/x-www-form-urlencoded',
    } = {}) {
      const url = new URL('/admin/access/', address);
      const headers = { 'Content-Type': contentType };
      if (origin !== null) headers.Origin = origin;
      const request = new Request(url, { method: 'POST', headers, body });
      const cookies = { get: name => name === ADMIN_COOKIE && cookie ? { value: cookie } : undefined };
      return handleAdminAccess({ request, url, locals: { account }, cookies }, {
        site, config, getDatabase: () => database,
      });
    },
  };
}

test('access change requires the separate admin deployment, session, and approved owner', async () => {
  const { submit, account, events } = setup();
  assert.equal((await submit(approval, { site: 'main' })).status, 404);
  assert.equal((await submit(approval, { cookie: null })).status, 401);
  assert.equal((await submit(approval, { cookie: 'other-session' })).status, 401);
  assert.equal((await submit(approval, { account: { ...owner, github_id: '3' } })).status, 403);
  assert.equal((await submit(approval, { account: { ...owner, status: 'waiting' } })).status, 403);
  assert.equal(account().status, 'waiting');
  assert.deepEqual(events(), []);
});

test('access change rejects cross-origin requests and an alternate admin hostname', async () => {
  const { submit, account } = setup();
  for (const origin of [null, 'null', 'https://example.com']) {
    assert.equal((await submit(approval, { origin })).status, 403);
  }
  assert.equal((await submit(approval, { origin: 'https://preview.example.com', address: 'https://preview.example.com' })).status, 403);
  assert.equal(account().status, 'waiting');
});

test('access change rejects oversized and invalid forms', async () => {
  const { submit, account } = setup();
  for (const body of [
    'x'.repeat(2049), 'github_id=02&status=approved&expected_status=waiting',
    'github_id=2&status=deleted&expected_status=waiting',
    'github_id=2&status=approved',
    approval + '&status=waiting',
  ]) {
    assert.equal((await submit(body)).status, 400);
  }
  assert.equal((await submit(approval, { contentType: 'text/plain' })).status, 400);
  assert.equal(account().status, 'waiting');
});

test('access change checks current owner approval and identity in the transaction', async () => {
  for (const currentOwner of [null, { ...owner, status: 'waiting' }, { ...owner, github_id: '3' }]) {
    const { submit, account, events } = setup({ currentOwner });
    assert.equal((await submit()).status, 403);
    assert.equal(account().status, 'waiting');
    assert.deepEqual(events(), []);
  }
});

test('the configured owner cannot change their own access', async () => {
  const { submit, events } = setup();
  assert.equal((await submit('github_id=1&status=waiting&expected_status=approved')).status, 403);
  assert.deepEqual(events(), []);
});

test('approval preserves account fields and creates an audit entry', async () => {
  const { submit, account, events } = setup();
  const response = await submit();
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/?access=updated');
  assert.deepEqual(account(), { ...applicant, status: 'approved' });
  const [event] = events();
  assert.ok(Number.isFinite(Date.parse(event.changed_at)));
  assert.deepEqual(events(), [{
    actor_github_id: '1', target_github_id: '2', before_status: 'waiting',
    after_status: 'approved', changed_at: event.changed_at,
  }]);
});

test('returning an approved account to waiting also records the change', async () => {
  const { submit, account, events } = setup({ target: { ...applicant, status: 'approved' } });
  assert.equal((await submit('github_id=2&status=waiting&expected_status=approved')).headers.get('location'), '/?access=updated');
  assert.deepEqual(account(), applicant);
  assert.equal(events()[0].after_status, 'waiting');
});

test('a stale repeat or no-op does not add an audit entry', async () => {
  const { submit, account, events } = setup();
  await submit();
  assert.equal((await submit()).headers.get('location'), '/?access=conflict');
  assert.equal((await submit('github_id=2&status=approved&expected_status=approved')).headers.get('location'), '/?access=conflict');
  assert.equal(account().status, 'approved');
  assert.equal(events().length, 1);
});

test('a missing account does not get created', async () => {
  const { submit, account, events } = setup({ target: null });
  assert.equal((await submit()).headers.get('location'), '/?access=conflict');
  assert.equal(account(), null);
  assert.deepEqual(events(), []);
});

test('an audit write failure also prevents the account update', async () => {
  const { submit, account, events } = setup({ failAudit: true });
  const response = await submit();
  assert.equal(response.headers.get('location'), '/?access=unavailable');
  assert.equal(await response.text(), '');
  assert.deepEqual(account(), applicant);
  assert.deepEqual(events(), []);
});
