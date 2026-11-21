import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRepositories, repositoryProject, githubHandle, importSelection } from '../src/scripts/github-import.mjs';
const repo = id => ({id,name:`project-${id}`,full_name:`mager/project-${id}`,html_url:`https://github.com/mager/project-${id}`,private:false,fork:id===1,archived:id===2});
test('reads every page, retains forks and archives, deduplicates overlapping results',async()=>{
  const urls=[];
  const repos=await fetchRepositories('@mager',{fetcher:async url=>{urls.push(url);return {ok:true,json:async()=>urls.length===1?Array.from({length:100},(_,i)=>repo(i)):[repo(99),repo(100)]};}});
  assert.equal(repos.length,101);assert.match(urls[1],/page=2$/);
  assert.equal(repos[1].fork,true);assert.equal(repos[2].archived,true);
});
test('pagination failure does not pass off partial results as complete',async()=>{
  let count=0;
  await assert.rejects(fetchRepositories('mager',{fetcher:async()=>++count===1?{ok:true,json:async()=>Array.from({length:100},(_,i)=>repo(i))}:{ok:false,status:403}}),/limit/);
});
test('reads public stars across pages and keeps their GitHub repository identities', async () => {
  const urls = [];
  const starred = { ...repo(100), full_name: 'upstream/project', html_url: 'https://github.com/upstream/project', fork: true };
  const results = await fetchRepositories('@mager', { source: 'stars', fetcher: async url => {
    urls.push(new URL(url));
    const items = urls.length === 1 ? Array.from({ length: 100 }, (_, index) => repo(index)) : [repo(99), starred, { ...repo(101), private: true }];
    return Response.json(items);
  } });
  assert.equal(urls[0].pathname, '/users/mager/starred');
  assert.equal(urls[0].searchParams.get('sort'), 'created');
  assert.equal(urls[1].searchParams.get('page'), '2');
  assert.equal(results.length, 101);
  assert.equal(results.at(-1).fullName, 'upstream/project');
  assert.equal(results.at(-1).project.source, starred.html_url);
  assert.equal(results.at(-1).fork, true);
});

test('reads later public owned repository pages even when the first page has no forks', async () => {
  const urls = [];
  const results = await fetchRepositories('mager', { source: 'forks', fetcher: async url => {
    urls.push(new URL(url));
    return Response.json(urls.length === 1 ? Array.from({ length: 100 }, (_, index) => ({ ...repo(index), fork: false })) : [repo(102), { ...repo(103), fork: true }]);
  } });
  assert.equal(urls.length, 2);
  assert.equal(urls[0].pathname, '/users/mager/repos');
  assert.equal(urls[0].searchParams.get('type'), 'owner');
  assert.deepEqual(results.map(result => result.fullName), ['mager/project-103']);
});
test('normalization excludes private repos and unsafe destinations',()=>{
  assert.equal(repositoryProject({...repo(1),private:true}),null);
  assert.equal(repositoryProject({...repo(1),html_url:'javascript:alert(1)'}),null);
  assert.equal(repositoryProject({...repo(1),homepage:'javascript:alert(1)'}).url,repo(1).html_url);
  assert.throws(()=>githubHandle('mager/repos?token=x'));
});
test('import keeps plans, preserves existing drafts, skips duplicate curated projects',()=>{
  const a=repositoryProject(repo(1)),b=repositoryProject(repo(2)),c=repositoryProject(repo(3));
  const raw=JSON.stringify({version:1,projects:[a],plan:{vitest:'started'},weekStartedAt:'2026-11-04'});
  const result=importSelection(raw,[a,b,c,c],[b],['vitest']);
  assert.equal(result.count,1);assert.equal(result.value.projects.length,2);assert.equal(result.value.plan.vitest,'started');assert.equal(result.value.weekStartedAt,'2026-11-04');
  assert.equal(importSelection(JSON.stringify(result.value),[a,b,c],[b],['vitest']).count,0);
});

test('import preserves an authored fork and its order after a GitHub rename', () => {
  const saved = { ...repositoryProject(repo(1)), tagline: 'My existing draft' };
  const renamed = repositoryProject({ ...repo(1), name: 'renamed', full_name: 'mager/renamed', html_url: 'https://github.com/mager/renamed' });
  const raw = JSON.stringify({ version: 1, projects: [saved], showcase: [saved.id] });
  const result = importSelection(raw, [renamed], [], []);
  assert.equal(result.count, 0);
  assert.deepEqual(result.value.projects, [saved]);
  assert.deepEqual(result.value.showcase, [saved.id]);
});
