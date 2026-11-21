import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { promisify } from 'node:util';
import { runSidework } from '../plugins/sidework/skills/sidework-pr-watch/scripts/sidework.mjs';
import { createGitHub } from '../plugins/sidework/skills/sidework-pr-watch/scripts/github.mjs';

function fixture() {
  let account = { id: '123', handle: '@developer' };
  let snapshot = { status: 'open', threads: [{ id: 'thread', isResolved: false, body: 'Please add a regression case.' }] };
  const github = {
    account: async () => account,
    repository: async repository => ({ repository, url: `https://github.com/${repository}`, fork: false }),
    contribution: async (repository, number) => ({ repository, number, url: `https://github.com/${repository}/pull/${number}` }),
    review: async () => {
      if (snapshot instanceof Error) throw snapshot;
      return snapshot;
    },
  };
  return { github, switchAccount: () => { account = { id: '456', handle: '@other' }; }, setSnapshot: next => { snapshot = next; } };
}

async function workspace(t, github) {
  const stateDirectory = await mkdtemp(join(tmpdir(), 'sidework-plugin-'));
  t.after(() => rm(stateDirectory, { recursive: true, force: true }));
  return { stateDirectory, run: (...args) => runSidework(args, { github, stateDirectory }) };
}

test('the installed PR skill carries its runner and can start outside a checkout', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'sidework-installed-skill-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const skill = new URL('../plugins/sidework/skills/sidework-pr-watch/', import.meta.url);
  const installed = join(directory, 'installed skill');
  await cp(skill, installed, { recursive: true });
  const { stdout } = await promisify(execFile)(process.execPath, [join(installed, 'scripts', 'sidework.mjs'), '--help'], { cwd: directory });
  assert.ok(JSON.parse(stdout).commands.includes('check'));
});

test('setup keeps public projects and selected contributions separate per GitHub account', async t => {
  const { github, switchAccount } = fixture();
  const { run } = await workspace(t, github);
  await run('project', 'add', 'https://github.com/Developer/theme');
  await run('project', 'add', 'developer/theme');
  await run('contribution', 'select', 'https://github.com/upstream/tool/pull/7#discussion_r42');
  const list = await run('list');
  assert.equal(list.projects.length, 1);
  assert.equal(list.contributions[0].number, 7);
  await assert.rejects(run('contribution', 'select', 'https://github.com.example/upstream/tool/pull/7'), /GitHub/);
  await run('contribution', 'deselect', 'UPSTREAM/tool#7');
  assert.deepEqual((await run('check')).pullRequests, []);
  await run('project', 'remove', 'developer/theme');
  assert.deepEqual((await run('list')).projects, []);
  await run('project', 'add', 'developer/theme');
  switchAccount();
  assert.deepEqual((await run('list')).projects, []);
});

test('poll reports changes, preserves its checkpoint on GitHub failure, and omits comment text from disk', async t => {
  const { github, setSnapshot } = fixture();
  const { run, stateDirectory } = await workspace(t, github);
  await run('contribution', 'select', 'upstream/tool#7');
  assert.equal((await run('poll')).pullRequests.length, 1);
  assert.equal((await run('poll')).pullRequests.length, 0);
  assert.equal((await run('check')).pullRequests.length, 1);
  setSnapshot(new Error('GitHub unavailable'));
  const failed = await run('poll');
  assert.equal(failed.checked, 0);
  assert.equal(failed.errors[0].number, 7);
  setSnapshot({ status: 'open', threads: [{ id: 'thread', isResolved: false, body: 'Please add a regression case.' }] });
  assert.equal((await run('poll')).pullRequests.length, 0);
  setSnapshot({ status: 'merged', threads: [] });
  assert.equal((await run('poll')).pullRequests[0].status, 'merged');
  const saved = await readFile(join(stateDirectory, '123', 'poll.json'), 'utf8');
  assert.doesNotMatch(saved, /regression|merged|thread/);
  await run('contribution', 'deselect', 'upstream/tool#7');
  await run('contribution', 'select', 'upstream/tool#7');
  assert.equal((await run('poll')).pullRequests.length, 1);
});

test('overlapping polls cannot report the same change twice', async t => {
  const { github } = fixture();
  const { run } = await workspace(t, github);
  await run('contribution', 'select', 'upstream/tool#7');
  const entered = Promise.withResolvers();
  const release = Promise.withResolvers();
  github.review = async () => {
    entered.resolve();
    await release.promise;
    return { status: 'open' };
  };
  const first = run('poll');
  await entered.promise;
  try {
    await assert.rejects(run('poll'), /Another Sidework operation/);
  } finally {
    release.resolve();
  }
  assert.equal((await first).pullRequests.length, 1);
  assert.equal((await run('poll')).pullRequests.length, 0);
});

test('GitHub selection verifies authorship and polling stops at the public repository check', async () => {
  let visibility = 'public';
  let requests = 0;
  const github = createGitHub(async ([endpoint]) => {
    if (endpoint === 'repos/upstream/tool') return { full_name: 'upstream/tool', visibility };
    requests++;
    if (endpoint.endsWith('/pulls/7')) return { user: { id: 999 } };
    throw new Error('Unexpected request');
  });
  await assert.rejects(github.contribution('upstream/tool', 7, { id: '123', handle: '@developer' }), /authored/);
  visibility = 'private';
  await assert.rejects(github.review('upstream/tool', 7), /public/);
  assert.equal(requests, 1);
});

test('review reads all thread pages and preserves resolution, review state, links, and limited evidence counts', async () => {
  const comment = { id: 'comment', url: 'https://github.com/upstream/tool/pull/7#discussion_r42', body: 'Add a regression case', author: { login: 'reviewer' }, createdAt: '2026-11-20T00:00:00Z' };
  const pending = { ...comment, id: 'pending', state: 'PENDING', body: 'Unpublished review' };
  const page = (id, isResolved) => ({ id, isResolved, isOutdated: false, path: 'test.js', firstComment: { nodes: [comment] }, comments: { totalCount: 12, nodes: [comment] } });
  const github = createGitHub(async ([endpoint], request) => {
    if (endpoint === 'repos/upstream/tool') return { full_name: 'upstream/tool', visibility: 'public' };
    const next = request.variables.cursor === 'next';
    return { data: { repository: { isPrivate: false, pullRequest: {
      title: 'Fix a bug', state: 'OPEN', isDraft: true, reviewDecision: 'CHANGES_REQUESTED',
      reviewThreads: { nodes: next ? [page('t2', true)] : [
        { ...page('t1', false), comments: { totalCount: 13, nodes: [comment, pending] } },
        { ...page('unpublished', false), firstComment: { nodes: [pending] }, comments: { totalCount: 1, nodes: [pending] } },
      ], pageInfo: { hasNextPage: !next, endCursor: next ? null : 'next' } },
      comments: { totalCount: 31, nodes: [comment] },
      reviews: { totalCount: 1, nodes: [{ ...comment, state: 'CHANGES_REQUESTED' }] },
    } } } };
  });
  const result = await github.review('upstream/tool', 7);
  assert.equal(result.status, 'draft');
  assert.equal(result.reviewDecision, 'CHANGES_REQUESTED');
  assert.equal(result.reviews[0].state, 'CHANGES_REQUESTED');
  assert.deepEqual(result.threads.map(item => item.isResolved), [false, true]);
  assert.equal(result.threads[0].comments[0].url, comment.url);
  assert.equal(result.threads[0].omittedComments, 11);
  assert.equal(result.omittedConversationComments, 30);
  assert.doesNotMatch(JSON.stringify(result), /Unpublished review/);
});
