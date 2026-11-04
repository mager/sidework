import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanProject, readState, mergeProjects } from '../src/scripts/sidework-state.mjs';
import { saveProjectDraft, showcaseProjects, toggleFeatured, moveFeatured, exportShowcase } from '../src/scripts/project-drafts.mjs';
import { importSelection } from '../src/scripts/github-import.mjs';
const seed=[{id:'one',name:'First',url:'https://one.example',source:'https://github.com/test/one',tagline:'The original story.'},{id:'two',name:'Second',url:'https://two.example'}];
const empty=()=>readState(null,['vitest']);
test('editing a seed creates a separate local draft and survives changes to source links',()=>{
  let state=saveProjectDraft(empty(),{...seed[0],name:'New name',source:'https://github.com/test/new',whyBuilt:'A real problem.',learned:'A useful tradeoff.',stage:'building'},seed);
  assert.equal(seed[0].name,'First');assert.equal(state.projects[0].local,true);
  assert.equal(mergeProjects(seed,state.projects).length,2);
  state=saveProjectDraft(state,{...state.projects[0],whyBuilt:'Revised story.'},seed);
  assert.equal(state.projects.length,1);
  const restored=readState(JSON.stringify({version:1,...state}),['vitest']);
  assert.equal(restored.projects[0].whyBuilt,'Revised story.');assert.equal(restored.projects[0].stage,'building');
});
test('duplicate projects are rejected without overwriting an existing draft',()=>{
  const state=saveProjectDraft(empty(),{...seed[0]},seed);
  assert.throws(()=>saveProjectDraft(state,{id:'other',name:'Duplicate',url:seed[0].url,source:seed[0].source},seed),/already/);
  assert.equal(state.projects.length,1);
});
test('draft fields reject unsafe image URLs, preserve valid data, and limit long text',()=>{
  const project=cleanProject({...seed[0],whyBuilt:'x'.repeat(1500),learned:'Learning',tagline:'A tool',image:'javascript:alert(1)',stage:'merged'});
  assert.equal(project.image,'');assert.equal(project.stage,'');assert.equal(project.whyBuilt.length,1200);
  assert.equal(cleanProject({...seed[0],image:'https://images.example/test.png'}).image,'https://images.example/test.png');
});
test('feature order persists, supports an explicitly empty list, and caps six projects',()=>{
  const projects=Array.from({length:7},(_,i)=>({id:String(i),name:String(i),url:`https://p${i}.example`}));
  let state=empty();
  for(let i=0;i<6;i++)state=toggleFeatured(state,String(i),projects,[]);
  assert.throws(()=>toggleFeatured(state,'6',projects,[]),/six/);
  state=moveFeatured(state,'5',-1,projects,[]);
  assert.deepEqual(state.showcase,['0','1','2','3','5','4']);
  const restored=readState(JSON.stringify({version:1,...state}),[]);
  assert.deepEqual(showcaseProjects(restored,projects,[]).map(p=>p.id),state.showcase);
  for(const id of [...state.showcase])state=toggleFeatured(state,id,projects,[]);
  assert.deepEqual(showcaseProjects(state,projects,['0']),[]);
});
test('a new repository import preserves stories, featured order, and the weekly plan',()=>{
  const state={...saveProjectDraft(empty(),{...seed[0],learned:'Keep this.'},seed),showcase:['one'],plan:{vitest:'started'}};
  const result=importSelection(JSON.stringify({version:1,...state}),[{id:'new',name:'New',url:'https://new.example',local:true}],seed,['vitest']);
  assert.equal(result.value.projects.find(p=>p.id==='one').learned,'Keep this.');assert.deepEqual(result.value.showcase,['one']);assert.equal(result.value.plan.vitest,'started');
});
test('export contains only selected projects and is marked as a private draft',()=>{
  const exported=exportShowcase({...empty(),showcase:['two']},seed,['one']);
  assert.equal(exported.visibility,'private-draft');assert.deepEqual(exported.projects.map(p=>p.id),['two']);assert.equal(exported.handle,'@mager');
});
