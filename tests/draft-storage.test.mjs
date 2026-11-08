import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {JSDOM} from 'jsdom';
import {createDraftWorkspace} from '../src/scripts/account-workspace.mjs';
import {browserDraftIdentity} from '../src/scripts/draft-identity.mjs';
import {MAX_ACCOUNT_DRAFT_BYTES} from '../src/scripts/account-draft-data.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const source=read('../src/components/DraftStorage.astro').replace(/^---[\s\S]*?---/,'').replace('{Astro.locals.account && ','').replace(/}\s*$/,'').replace(/<script[\s\S]*?\/>/,'');
const script=stripTypeScriptTypes(read('../src/scripts/draft-storage.ts')).replace(/^import .*;$/gm,'').replace('export async function','async function');
const project={id:'homeport',name:'Homeport',description:'A workspace.',url:'https://example.com/homeport'};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(){
 const dom=new JSDOM(`<meta name="sidework-account" content="1234"><meta name="sidework-handle" content="@builder">${source}<div id="editor"></div><script id="draft-storage-seed" type="application/json">${JSON.stringify([project])}</script>`,{url:'https://sidework.example/workbench/',runScripts:'outside-only'});
 dom.window.localStorage.setItem('workspace',JSON.stringify({version:1,projects:[],showcase:['homeport'],includeExamples:true}));
 dom.window.structuredClone=structuredClone;dom.window.Error=Error;
 let record={revision:0,updatedAt:null,drafts:{projects:[],showcase:[],contributionDrafts:[]}};
 dom.window.dependencies={MAX_ACCOUNT_DRAFT_BYTES,STORAGE_KEY:'workspace',browserDraftIdentity:()=>browserDraftIdentity(dom.window.document),createDraftWorkspace:options=>createDraftWorkspace({...options,fetcher:async(url,request)=>{if(request.method==='PUT'){const body=JSON.parse(request.body);assert.equal(body.revision,record.revision);record={revision:record.revision+1,updatedAt:'2026-11-08T15:00:00Z',drafts:body.drafts};}return Response.json(record);}})};
 dom.window.eval(`const {${Object.keys(dom.window.dependencies).join(',')}}=window.dependencies;${script};window.openWorkspace=openDraftWorkspace;`);
 const work=await dom.window.openWorkspace(dom.window.document.querySelector('#editor'));
 return {dom,work,get:()=>record};
}
test('a same-page save invalidates an older import review before it can replace newer work',async()=>{
 const {dom,work,get}=await setup(),doc=dom.window.document;
 doc.getElementById('draft-storage-import').click();assert.equal(doc.getElementById('draft-storage-review').hidden,false);
 await work.save({...work.read(),projects:[{...project,name:'Newer title'}],showcase:['homeport']});
 doc.getElementById('draft-storage-confirm').click();await settle();
 assert.equal(get().revision,1);assert.equal(get().drafts.projects[0].name,'Newer title');
 assert.match(doc.getElementById('draft-storage-status').textContent,/changed while this review/);dom.window.close();
});
test('shared browser import resolves featured examples on pages that pass no seed argument',async()=>{
 const {dom,get}=await setup(),doc=dom.window.document;
 doc.getElementById('draft-storage-import').click();
 assert.match(doc.getElementById('draft-storage-review-list').textContent,/Homeport.*Featured/);
 assert.equal(get().revision,0);
 doc.getElementById('draft-storage-confirm').click();await settle();
 assert.equal(get().drafts.projects[0].name,'Homeport');assert.deepEqual(get().drafts.showcase,['homeport']);
 assert.equal(JSON.parse(dom.window.localStorage.getItem('workspace')).projects.length,0);dom.window.close();
});
