import test from 'node:test';
import assert from 'node:assert/strict';
import { workFeed } from '../src/scripts/work-feed.mjs';

const projects = [
  { id:'music', name:'Music', category:'learning', tagline:'Learn through songs.' },
  { id:'shell', name:'Shell', category:'developer-tools', tagline:'A shell tool.' },
];
const stories = [
  { id:'sdk', name:'SDK', repository:'team/sdk', author:'@maker', story:'Added a client.' },
  { id:'own', name:'Own fork', repository:'Maker/fork', author:'@maker', story:'An owned repository.' },
  { id:'docs', name:'Docs', repository:'upstream/docs', author:'@maker', story:'Wrote examples.' },
  { id:'fix', name:'Fix', repository:'upstream/fix', author:'@maker', story:'Fixed a bug.' },
];

test('all work alternates projects and external contributions without losing order or trailing stories', () => {
  const result = workFeed(projects, stories);
  assert.deepEqual(result.entries.map(item => item.id), ['music','sdk','shell','docs','fix']);
  assert.equal(result.entries[1].detail, 'team/sdk');
  assert.equal(result.entries[1].href, '/contributions/sdk/');
  assert.equal(result.entries[0].href, '/projects/music/');
  assert.equal(stories.length, 4);
});

test('contributions exclude own-account repositories and ignore a stale project category', () => {
  const result = workFeed(projects, stories, {kind:'contributions', category:'learning'});
  assert.equal(result.category, '');
  assert.deepEqual(result.entries.map(item => item.id), ['sdk','docs','fix']);
});

test('project category links keep their meaning, including old links without a kind', () => {
  assert.deepEqual(workFeed(projects, stories, {category:'learning'}).entries.map(item => item.id), ['music']);
  assert.deepEqual(workFeed(projects, stories, {kind:'projects', category:'utilities'}).entries, []);
  assert.equal(workFeed(projects, stories, {kind:'projects', category:'invalid'}).entries.length, 2);
});

test('unknown filters and empty collections retain all available work', () => {
  assert.equal(workFeed(projects, stories, {kind:'unknown', category:'invalid'}).entries.length, 5);
  assert.equal(workFeed([], stories).entries.length, 3);
  assert.equal(workFeed(projects, []).entries.length, 2);
  assert.deepEqual(workFeed([], []).entries, []);
});
