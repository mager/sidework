import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, readState, mergeProjects, githubContribution, filterContributions } from '../src/scripts/sidework-state.mjs';

test('project links reject executable schemes and embedded credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.com', '/relative', 'not a URL']) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('https://example.com/demo'), 'https://example.com/demo');
});
test('corrupt or incompatible saved state does not break the workbench', () => {
  for (const raw of ['{bad', 'null', '{"version":2}', '[]']) assert.deepEqual(readState(raw, ['vitest']).plan, {});
});
test('saved state accepts only known opportunities and valid progress values', () => {
  const state = readState(JSON.stringify({version: 1, plan: {vitest: 'submitted', pagefind: 'invented', unknown: 'submitted'}, projects: [{name: 'Bad',url:'javascript:alert(1)'},{id:'one',name:'Useful tool',url:'https://example.com',local:true}]}), ['vitest','pagefind']);
  assert.deepEqual(state.plan, {vitest:'submitted'}); assert.equal(state.projects.length,1);
  assert.equal(state.projects[0].local,true);
});
test('repo import does not duplicate curated projects with the same source', () => {
  const seed = [{name:'Homeport',url:'https://demo.example',source:'https://github.com/mager/homeport'}];
  const imported = [{name:'homeport',url:'https://github.com/mager/homeport/',source:'https://github.com/mager/homeport/'}];
  assert.equal(mergeProjects(seed, imported).length,1);
});
test('GitHub closed PRs are not reported as merged without evidence', () => {
  const base = {title:'A fix',number:12,html_url:'https://github.com/owner/repo/pull/12',pull_request:{},state:'closed',created_at:'2026-11-01T10:00:00Z'};
  assert.equal(githubContribution(base,'2026-11-04').status,'closed');
  assert.equal(githubContribution({...base,pull_request:{merged_at:'2026-11-03'}},'2026-11-04').status,'merged');
  assert.equal(githubContribution({...base,state:'open',draft:true},'2026-11-04').status,'draft');
  assert.equal(githubContribution({...base,html_url:'https://example.com/pull/12'},'2026-11-04'),null);
});
test('search and state filters combine without losing source records', () => {
  const items = [{title:'Fix focus',repository:'vitest-dev/vitest',number:1,status:'merged'},{title:'Fix focus',repository:'some/repo',number:2,status:'draft'}];
  assert.equal(filterContributions(items,' FOCUS ','merged').length,1);
  assert.equal(filterContributions(items,'#2','all')[0].status,'draft');
  assert.equal(filterContributions(items,'unknown','all').length,0);
  assert.equal(items.length,2);
});
