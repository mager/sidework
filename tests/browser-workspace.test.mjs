import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import * as workspace from '../src/scripts/browser-workspace.mjs';
import { STORAGE_KEY, readState } from '../src/scripts/sidework-state.mjs';
import { importSelection } from '../src/scripts/github-import.mjs';
const makeStorage = () => new JSDOM('',{url:'https://sidework.example'});

test('reset clears local work and follows while retaining theme and a restorable copy',()=>{
 const dom=makeStorage(),storage=dom.window.localStorage;
 const before=JSON.stringify({version:1,projects:[{id:'one',name:'One',url:'https://example.com'}],plan:{vitest:'started'},showcase:['one']});
 storage.setItem(STORAGE_KEY,before);storage.setItem(workspace.FOLLOW_KEY,'true');storage.setItem(workspace.COLLECTION_KEY,'["homeport"]');storage.setItem('sidework-theme','dark');storage.setItem('unrelated','keep');
 workspace.resetWorkspace(storage);
 const state=readState(storage.getItem(STORAGE_KEY),['vitest']);
 assert.deepEqual(state.projects,[]);assert.deepEqual(state.plan,{});assert.deepEqual(state.showcase,[]);assert.equal(state.includeExamples,false);
 assert.equal(storage.getItem(workspace.FOLLOW_KEY),null);assert.equal(storage.getItem(workspace.COLLECTION_KEY),null);assert.equal(storage.getItem('sidework-theme'),'dark');assert.equal(storage.getItem('unrelated'),'keep');
 workspace.restoreWorkspace(storage);
 assert.equal(storage.getItem(STORAGE_KEY),before);assert.equal(storage.getItem(workspace.FOLLOW_KEY),'true');assert.equal(storage.getItem(workspace.COLLECTION_KEY),'["homeport"]');dom.window.close();
});
test('failed reset backup leaves the current workspace untouched',()=>{
 const dom=makeStorage(),storage=dom.window.localStorage;storage.setItem(workspace.FOLLOW_KEY,'true');
 const blocked={getItem:key=>storage.getItem(key),setItem(){throw new Error('full');},removeItem:key=>storage.removeItem(key)};
 assert.throws(()=>workspace.resetWorkspace(blocked),/full/);assert.equal(storage.getItem(workspace.FOLLOW_KEY),'true');dom.window.close();
});
test('partial reset failure restores the prior values',()=>{
 const dom=makeStorage(),storage=dom.window.localStorage;storage.setItem(STORAGE_KEY,'original');storage.setItem(workspace.FOLLOW_KEY,'true');
 let failed=false;const failOnce={getItem:key=>storage.getItem(key),setItem:(key,value)=>storage.setItem(key,value),removeItem(key){if(!failed&&key===workspace.FOLLOW_KEY){failed=true;throw new Error('blocked');}storage.removeItem(key);}};
 assert.throws(()=>workspace.resetWorkspace(failOnce),/blocked/);assert.equal(storage.getItem(STORAGE_KEY),'original');assert.equal(storage.getItem(workspace.FOLLOW_KEY),'true');dom.window.close();
});
test('new workspaces can import a public example without inheriting other examples',()=>{
 const project={id:'homeport',name:'Homeport',url:'https://example.com',source:'https://github.com/mager/homeport'};
 const fresh=importSelection(null,[project],[project],[]);
 assert.equal(fresh.count,1);assert.equal(fresh.value.includeExamples,false);
 assert.equal(importSelection(JSON.stringify(fresh.value),[project],[project],[]).count,0);
 assert.equal(readState(JSON.stringify({version:1}),[]).includeExamples,true);
});
test('Friends follows, unfollows, and responds to a reset in another tab',()=>{
 const source=readFileSync(new URL('../src/pages/friends.astro',import.meta.url),'utf8').replace(/^---[\s\S]*?---/,'');
 const script=stripTypeScriptTypes(readFileSync(new URL('../src/scripts/friends.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
 const dom=new JSDOM(source,{url:'https://sidework.example/friends/',runScripts:'outside-only'});
 dom.window.dependencies=workspace;dom.window.eval(`const {${Object.keys(workspace).join(',')}}=window.dependencies;${script}`);
 const doc=dom.window.document;assert.equal(doc.querySelector('#friends-empty').hidden,false);
 doc.querySelector('#follow-mager').click();assert.equal(doc.querySelector('#friend-mager').hidden,false);assert.equal(dom.window.localStorage.getItem(workspace.FOLLOW_KEY),'true');
 doc.querySelector('#unfollow-mager').click();assert.equal(doc.querySelector('#friends-empty').hidden,false);assert.equal(doc.activeElement.id,'follow-mager');
 dom.window.localStorage.setItem(workspace.FOLLOW_KEY,'true');dom.window.dispatchEvent(new dom.window.StorageEvent('storage',{key:workspace.FOLLOW_KEY,newValue:'true'}));assert.equal(doc.querySelector('#friend-mager').hidden,false);
 dom.window.localStorage.removeItem(workspace.FOLLOW_KEY);dom.window.dispatchEvent(new dom.window.StorageEvent('storage',{key:workspace.FOLLOW_KEY}));assert.equal(doc.querySelector('#friends-empty').hidden,false);dom.window.close();
});

function settings() {
 const source=readFileSync(new URL('../src/pages/settings.astro',import.meta.url),'utf8').replace(/^---[\s\S]*?---/,'');
 const script=stripTypeScriptTypes(readFileSync(new URL('../src/scripts/settings.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replaceAll("location.assign('/friends/')", "window.destination = '/friends/'");
 const dom=new JSDOM(source,{url:'https://sidework.example/settings/',runScripts:'outside-only'});
 dom.window.dependencies=workspace;dom.window.eval(`const {${Object.keys(workspace).join(',')}}=window.dependencies;${script}`);
 return dom;
}
test('Settings resets and restores the workspace before returning to Friends',()=>{
 const dom=settings(),doc=dom.window.document,storage=dom.window.localStorage;
 storage.setItem(workspace.FOLLOW_KEY,'true');storage.setItem('sidework-theme','dark');
 doc.querySelector('#reset-workspace').click();
 assert.equal(dom.window.destination,'/friends/');assert.equal(storage.getItem(workspace.FOLLOW_KEY),null);
 assert.equal(storage.getItem('sidework-theme'),'dark');assert.ok(storage.getItem(workspace.RESET_BACKUP_KEY));
 dom.window.dispatchEvent(new dom.window.StorageEvent('storage'));
 assert.equal(doc.querySelector('#restore-workspace').hidden,false);
 doc.querySelector('#restore-workspace').click();assert.equal(storage.getItem(workspace.FOLLOW_KEY),'true');dom.window.close();
});
test('Settings keeps the page and existing work when the reset backup fails',()=>{
 const dom=settings(),doc=dom.window.document;dom.window.localStorage.setItem(workspace.FOLLOW_KEY,'true');
 Object.defineProperty(dom.window.Storage.prototype,'setItem',{value(){throw new Error('Storage full');}});
 doc.querySelector('#reset-workspace').click();assert.equal(dom.window.destination,undefined);
 assert.equal(dom.window.localStorage.getItem(workspace.FOLLOW_KEY),'true');
 assert.equal(doc.querySelector('#settings-status').hidden,false);assert.match(doc.querySelector('#settings-status').textContent,/could not finish/);dom.window.close();
});
