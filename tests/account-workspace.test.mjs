import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraftWorkspace } from '../src/scripts/account-workspace.mjs';

const identity={githubId:'1234',handle:'@builder'};
const key='test-workspace:github:1234';
const project={id:'one',name:'One',description:'A useful project.',url:'https://one.example'};
const story={id:'fix-one',name:'Shared tool',handle:'@builder',repository:'upstream/tool',story:'Fixed a keyboard issue.',evidence:'https://github.com/upstream/tool/pull/1'};
function storage(raw) { const map=new Map(raw?[[key,JSON.stringify(raw)]]:[]);return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}; }
function server() {
 let record={revision:0,updatedAt:null,drafts:{projects:[],showcase:[],contributionDrafts:[]}};
 const fetcher=async(url,options)=>{
  assert.equal(options.headers['X-Sidework-Account'],identity.githubId);
  if(options.method==='PUT') {
   const input=JSON.parse(options.body);
   if(input.revision!==record.revision)return Response.json({error:'Saved drafts changed elsewhere. Download your changes, then reload.'},{status:409});
   record={revision:record.revision+1,updatedAt:'2026-11-08T14:00:00Z',drafts:input.drafts};
  }
  return Response.json(structuredClone(record));
 };
 return {fetcher,get:()=>record};
}
test('account work loads from a second client and never uploads or changes old browser drafts automatically',async()=>{
 const local=storage({version:1,projects:[{...project,id:'local'}],plan:{test:'started'},showcase:['local'],includeExamples:false});
 const raw=local.getItem(key),api=server();
 const first=createDraftWorkspace({identity,storage:local,key,fetcher:api.fetcher});
 await first.load(); assert.deepEqual(first.read().projects,[]);assert.equal(first.read().plan.test,'started');
 assert.equal(api.get().revision,0); assert.equal(local.getItem(key),raw);
 await first.save({...first.read(),projects:[project],showcase:['one'],contributionDrafts:[story]});
 const second=createDraftWorkspace({identity,storage:storage(),key,fetcher:api.fetcher});
 await second.load(); assert.equal(second.read().projects[0].name,'One');assert.equal(second.read().contributionDrafts[0].story,story.story);assert.deepEqual(second.read().showcase,['one']);
 assert.equal(local.getItem(key),raw);
});
test('conflicts and lost responses retain a recovery copy without overwriting the newer saved workspace',async()=>{
 const api=server(),first=createDraftWorkspace({identity,storage:storage(),key,fetcher:api.fetcher}),second=createDraftWorkspace({identity,storage:storage(),key,fetcher:api.fetcher});
 await first.load();await second.load();
 await first.save({...first.read(),projects:[project]});
 await assert.rejects(second.save({...second.read(),projects:[{...project,name:'Unsaved text'}]}),/changed elsewhere/);
 assert.equal(api.get().drafts.projects[0].name,'One');assert.equal(second.recovery().drafts.projects[0].name,'Unsaved text');assert.deepEqual(second.read().projects,[]);
 const offline=createDraftWorkspace({identity,storage:storage(),key,fetcher:async(...args)=>{if(args[1].method==='PUT')throw Error('offline');return api.fetcher(...args);}});
 await offline.load();await assert.rejects(offline.save({...offline.read(),contributionDrafts:[story]}),/could not be confirmed/);
 assert.equal(offline.recovery().drafts.contributionDrafts[0].story,story.story);
});
test('browser import needs an explicit save and preserves saved stories, order, and the browser source',async()=>{
 const api=server(),local=storage({version:1,includeExamples:false,projects:[{...project,name:'Older local text'},{...project,id:'two',url:'https://two.example'}],showcase:['two','one'],contributionDrafts:[story]});
 const work=createDraftWorkspace({identity,storage:local,key,fetcher:api.fetcher});await work.load();await work.save({...work.read(),projects:[project],showcase:['one']});
 const before=local.getItem(key),review=work.reviewBrowserImport([]);
 assert.equal(api.get().revision,1);assert.equal(review.projects.find(p=>p.id==='one').name,'One');assert.deepEqual(review.showcase,['one','two']);
 await work.save({...work.read(),...review});assert.equal(local.getItem(key),before);assert.equal(api.get().drafts.contributionDrafts.length,1);
});
test('recovery files are account-bound and never save before review',async()=>{
 const api=server(),work=createDraftWorkspace({identity,storage:storage(),key,fetcher:api.fetcher});await work.load();
 const backup={format:'sidework-account-drafts',version:1,githubId:identity.githubId,handle:identity.handle,drafts:{projects:[project],showcase:['one'],contributionDrafts:[story]}};
 assert.throws(()=>work.reviewRecovery({...backup,githubId:'9999'}),/another account/);
 assert.equal(work.reviewRecovery(backup).projects[0].id,'one');assert.equal(api.get().revision,0);
  const initialRevision=work.revision;
  await work.save({...work.read(),...backup.drafts});assert.notEqual(work.revision,initialRevision);
  assert.deepEqual(work.reviewRecovery({...backup,drafts:{projects:[],showcase:[],contributionDrafts:[]}}),{projects:[],showcase:[],contributionDrafts:[]});
  assert.equal(api.get().drafts.projects.length,1);
});
test('failed initial load cannot fall back to browser drafts; legacy sessions stay local',async()=>{
 const local=storage({version:1,includeExamples:false,projects:[project]});
 const work=createDraftWorkspace({identity,storage:local,key,fetcher:async()=>Response.json({error:'Sign in again.'},{status:401})});
 await assert.rejects(work.load(),/Sign in/);assert.throws(()=>work.read(),/not loaded/);
 const legacy=createDraftWorkspace({identity:null,storage:local,key,fetcher:()=>{throw Error('must not fetch');}});await legacy.load();
 assert.equal(legacy.read().projects[0].name,'One');await legacy.save({...legacy.read(),showcase:['one']});assert.deepEqual(JSON.parse(local.getItem(key)).showcase,['one']);
});
