import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createDraftWorkspace } from '../src/scripts/account-workspace.mjs';
import * as drafts from '../src/scripts/contribution-drafts.mjs';
import { STORAGE_KEY, readState } from '../src/scripts/sidework-state.mjs';
import { resetWorkspace,restoreWorkspace } from '../src/scripts/browser-workspace.mjs';
import { importSelection } from '../src/scripts/github-import.mjs';
const draft={id:'test-story',name:'Impeccable',handle:'@mager',repository:'pbakaus/impeccable',story:'Improve the extension popup.',evidence:'https://github.com/pbakaus/impeccable/pull/1157'};
test('contribution drafts reject unsafe links, foreign evidence and unverified state fields',()=>{
 for(const evidence of ['javascript:alert(1)','https://github.com.evil.test/pbakaus/impeccable/pull/1157','https://user:password@github.com/pbakaus/impeccable/pull/1157','https://github.com/other/project/pull/1157','https://github.com/pbakaus/impeccable'])assert.equal(drafts.cleanContributionDraft({...draft,evidence}),null);
 assert.equal(drafts.cleanContributionDraft({...draft,status:'merged'}).status,undefined);
 assert.throws(()=>drafts.saveContributionDraft('{bad',draft));
});
test('stories survive project imports, edits, reset and restore without changing project order or plans',()=>{
 const base={version:1,projects:[],plan:{vitest:'started'},showcase:['homeport'],includeExamples:false};
 const saved=drafts.saveContributionDraft(JSON.stringify(base),draft);
 const imported=importSelection(JSON.stringify(saved),[{id:'repo',name:'Repo',url:'https://example.com'}],[],['vitest']).value;
 const read=readState(JSON.stringify(imported),['vitest']);
 assert.equal(read.contributionDrafts[0].story,draft.story);assert.deepEqual(read.showcase,['homeport']);assert.equal(read.plan.vitest,'started');
 const edited=drafts.saveContributionDraft(JSON.stringify(imported),{...draft,story:'Changed story.'});assert.equal(edited.contributionDrafts.length,1);
 const dom=new JSDOM('',{url:'https://sidework.example'}),storage=dom.window.localStorage;
 storage.setItem(STORAGE_KEY,JSON.stringify(edited));resetWorkspace(storage);assert.deepEqual(readState(storage.getItem(STORAGE_KEY),[]).contributionDrafts,[]);restoreWorkspace(storage);assert.equal(readState(storage.getItem(STORAGE_KEY),[]).contributionDrafts[0].story,'Changed story.');dom.window.close();
});
async function editor(options={}){
 const source=readFileSync(new URL('../src/pages/contributions/drafts.astro',import.meta.url),'utf8').replace(/^---[\s\S]*?---/,'');
 const script=stripTypeScriptTypes(readFileSync(new URL('../src/scripts/contribution-editor.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
 const dom=new JSDOM(source,{url:'https://sidework.example/contributions/drafts/',runScripts:'outside-only'});if(options.identity)dom.window.document.head.innerHTML=`<meta name="sidework-account" content="${options.identity.githubId}"><meta name="sidework-handle" content="${options.identity.handle}">`;dom.window.Error=Error;dom.window.dependencies={...drafts,STORAGE_KEY,browserDraftIdentity:()=>options.identity||null,openDraftWorkspace:async()=>{const work=createDraftWorkspace({identity:options.identity,fetcher:options.fetcher,storage:dom.window.localStorage,key:STORAGE_KEY});await work.load();return work;}};dom.window.eval(`const {${Object.keys(dom.window.dependencies).join(',')}}=window.dependencies;${script}`);await new Promise(resolve=>setImmediate(resolve));return dom;
}
test('editor saves text safely, reloads drafts and retains text when storage fails',async()=>{
 const dom=await editor(),doc=dom.window.document,form=doc.querySelector('form');
 for(const key of ['name','handle','repository','story','evidence'])form.elements.namedItem(key).value=key==='story'?'<img src=x onerror=alert(1)>':draft[key];
 form.dispatchEvent(new dom.window.Event('input'));assert.equal(doc.querySelector('#preview-story img'),null);
 form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));assert.match(doc.querySelector('#contribution-status').textContent,/saved in this browser/);
 const stored=dom.window.localStorage.getItem(STORAGE_KEY);assert.equal(JSON.parse(stored).contributionDrafts.length,1);
 Object.defineProperty(dom.window.Storage.prototype,'setItem',{value(){throw new Error('quota');}});
 form.elements.namedItem('story').value='Keep this unsaved text';form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(dom.window.localStorage.getItem(STORAGE_KEY),stored);assert.equal(form.elements.namedItem('story').value,'Keep this unsaved text');assert.match(doc.querySelector('#contribution-status').textContent,/could not be saved/);dom.window.close();
});
test('a workbench loaded before a story save keeps the latest stories on plan and project writes',()=>{
 const stale=readState(null,['vitest']);
 const latest=drafts.saveContributionDraft(null,draft);
 const planWrite=drafts.withLatestContributionDrafts(JSON.stringify(latest),{...stale,plan:{vitest:'started'}});
 assert.equal(planWrite.contributionDrafts[0].id,draft.id);assert.equal(planWrite.plan.vitest,'started');
 const changed=drafts.saveContributionDraft(JSON.stringify(latest),{...draft,story:'A newer version.'});
 const projectWrite=drafts.withLatestContributionDrafts(JSON.stringify(changed),{...stale,projects:[{id:'local',name:'Local',url:'https://example.com'}]});
 assert.equal(projectWrite.contributionDrafts[0].story,'A newer version.');assert.equal(projectWrite.projects.length,1);
 assert.deepEqual(drafts.withLatestContributionDrafts(null,projectWrite).contributionDrafts,[]);
});

test('account contribution editor loads the signed-in handle and saves a story for another client',async()=>{
 let record={revision:0,updatedAt:null,drafts:{projects:[],showcase:[],contributionDrafts:[]}};
 const fetcher=async(url,options)=>{if(options.method==='PUT'){const value=JSON.parse(options.body);record={revision:record.revision+1,updatedAt:'2026-11-08T15:00:00Z',drafts:value.drafts};}return Response.json(record);};
 const options={identity:{githubId:'1234',handle:'@builder'},fetcher};
 const first=await editor(options),form=first.window.document.querySelector('form');
 assert.equal(form.elements.namedItem('handle').value,'@builder');
 for(const key of ['name','repository','story','evidence'])form.elements.namedItem(key).value=draft[key];
 form.dispatchEvent(new first.window.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.match(first.window.document.querySelector('#contribution-status').textContent,/saved to your account/);
 assert.equal(first.window.localStorage.getItem(STORAGE_KEY),null);
 const second=await editor(options);assert.match(second.window.document.querySelector('#contribution-draft-list').textContent,/Impeccable/);
 second.window.document.querySelector('#contribution-draft-list button').click();assert.equal(second.window.document.querySelector('[name=story]').value,draft.story);
 first.window.close();second.window.close();
});
