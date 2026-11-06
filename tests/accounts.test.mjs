import test from 'node:test';
import assert from 'node:assert/strict';
import { accountStore } from '../src/lib/accounts.mjs';

function memoryDatabase() {
  const records = new Map();
  const snapshot = id => ({ exists: records.has(id), data: () => structuredClone(records.get(id)) });
  const update = (ref, fields) => {
    if (!records.has(ref.id)) throw new Error('not-found');
    records.set(ref.id, { ...records.get(ref.id), ...fields });
  };
  return {
    records,
    collection: () => ({ doc: id => ({ id, get: async () => snapshot(id), update: async fields => update({ id }, fields) }) }),
    runTransaction: async action => action({ get: async ref => snapshot(ref.id), update, create: (ref, fields) => {
      assert.equal(records.has(ref.id), false);
      records.set(ref.id, structuredClone(fields));
    } }),
  };
}

test('new GitHub accounts wait; only the configured numeric owner ID starts approved', async () => {
  const db = memoryDatabase(), store = accountStore({ ownerId: '17733' }, db);
  const waiting = await store.save({ githubId: '123', login: 'mager', email: 'new@example.com' }, false);
  assert.equal(waiting.status, 'waiting');
  assert.equal(waiting.email_updates, false);
  const owner = await store.save({ githubId: '17733', login: 'renamed-owner', email: 'owner@example.com' }, true);
  assert.equal(owner.status, 'approved');
  assert.equal(owner.email_updates, true);
  assert.equal((await store.find('17733')).login, 'renamed-owner');
  assert.equal(await store.find('456'), null);
  await assert.rejects(store.find('../17733'), /Invalid account/);
});

test('repeat sign-in preserves approval and consent while refreshing identity', async () => {
  const db = memoryDatabase(), store = accountStore({ ownerId: '17733' }, db);
  const initial = await store.save({ githubId: '17733', login: 'mager', email: 'old@example.com' }, true);
  db.records.get('17733').status = 'waiting';
  await store.setUpdates('17733', false);
  const repeat = await store.save({ githubId: '17733', login: 'new-handle', email: 'new@example.com' }, true);
  assert.equal(repeat.status, 'waiting');
  assert.equal(repeat.email_updates, false);
  assert.equal(repeat.created_at, initial.created_at);
  assert.equal(repeat.login, 'new-handle');
  assert.equal(repeat.email, 'new@example.com');
  assert.equal((await store.find('17733')).email_updates, false);
  await assert.rejects(store.setUpdates('999', true), /not-found/);
  assert.equal(await store.find('999'), null);
});
