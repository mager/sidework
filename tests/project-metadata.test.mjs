import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMetadata, validateMetadata, projectMatches } from '../src/scripts/project-metadata.mjs';
import { readState } from '../src/scripts/sidework-state.mjs';
import { saveProjectDraft, exportShowcase } from '../src/scripts/project-drafts.mjs';
import { repositoryProject, importSelection } from '../src/scripts/github-import.mjs';
import { parseProfileDraft, mergeProfileDraft, decodeReviewLink } from '../src/scripts/draft-transfer.mjs';
import { prepareDraft } from '../src/lib/agent-server.mjs';
const project = {id:'shell',name:'Shell tool',url:'https://example.com',source:'https://github.com/test/shell',description:'Customize a prompt.',category:'developer-tools',softwareType:'cli',audience:'Shell users',features:['Preview colors','Export a theme']};

test('metadata survives storage, duplicate GitHub import, export, agent review, and restore',async()=>{
  let state=saveProjectDraft(readState(null,[]),project);
  state.showcase=['shell'];
  const imported=repositoryProject({id:1,name:'shell',full_name:'test/shell',html_url:project.source,private:false,description:'Upstream description',language:'Rust'});
  assert.equal(imported.category,'');assert.deepEqual(imported.features,[]);
  const result=importSelection(JSON.stringify({version:1,...state}),[imported],[],[]);
  assert.equal(result.count,0);assert.equal(result.value.projects[0].description,project.description);
  const restored=readState(JSON.stringify(result.value),[]);
  const exported=exportShowcase(restored,restored.projects,[]);
  const prepared=prepareDraft(parseProfileDraft(exported).projects,'https://sidework.example');
  const decoded=await decodeReviewLink(new URL(prepared.reviewUrl).hash.slice(8));
  const merged=mergeProfileDraft(readState(null,[]),decoded,[]);
  assert.deepEqual(cleanMetadata(merged.projects[0]),cleanMetadata(project));
});

test('old drafts remain valid while bad new metadata is rejected before save or review',()=>{
  const old={id:'old',name:'Old',url:'https://old.example',description:'Original'};
  assert.deepEqual(cleanMetadata(old),{category:'',softwareType:'',audience:'',features:[]});
  assert.equal(prepareDraft([old],'https://sidework.example').draft.projects[0].name,'Old');
  for(const invalid of [{category:'Rust'},{softwareType:'__proto__'},{audience:'a'.repeat(181)},{features:'not an array'},{features:['x'.repeat(161)]},{features:Array(6).fill('Feature')},{features:[null]}]){
    assert.throws(()=>validateMetadata({...project,...invalid}));
    assert.throws(()=>saveProjectDraft(readState(null,[]),{...project,...invalid}));
    assert.throws(()=>prepareDraft([{...project,...invalid}],'https://sidework.example'));
  }
});

test('search combines purpose, audience, feature and type text with a category filter',()=>{
  for(const query of ['shell users','export a theme','COMMAND-LINE','Developer tools']) assert.ok(projectMatches(project,query,'developer-tools'));
  assert.equal(projectMatches(project,'shell','games'),false);
  assert.equal(projectMatches(project,'missing'),false);
});
