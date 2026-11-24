import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
import * as imports from '../src/scripts/github-import.mjs';
import { readState } from '../src/scripts/sidework-state.mjs';

const source=stripTypeScriptTypes(readFileSync(new URL('../src/scripts/onboarding.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('location.assign(editUrl)','window.destination = editUrl');
const repositories=[1,2].map(id=>({fullName:`builder/project-${id}`,fork:false,archived:false,project:{id:`github-${id}`,name:`Project ${id}`,description:'Real source description.',url:`https://github.com/builder/project-${id}`,source:`https://github.com/builder/project-${id}`,stack:'TypeScript'}}));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function chooser({fail=false,existing=[]}={}) {
 const markup=`<main id="main"><form id="github-import-form"><input name="source" type="radio" value="repositories" checked><input name="source" type="radio" value="stars"><input id="github-handle" value="@builder"><button id="find-repos"><span id="find-repos-label"></span></button><button id="cancel-import" hidden></button></form><p id="import-status"></p><section id="repo-results" hidden><input id="repo-search"><label id="include-forks-control"><input id="include-forks" type="checkbox" checked></label><input id="include-archived" type="checkbox" checked><button id="select-matching"></button><button id="clear-selection"></button><p id="repo-count"></p><ul id="repo-list"></ul><button id="show-more"></button><div id="import-actions"><span id="selection-count"></span><button id="import-selected"></button></div></section><div id="import-result"><p id="import-result-text"></p><a></a></div><script id="import-seed" type="application/json">{"projects":[],"opportunityIds":[]}</script></main>`;
 const dom=new JSDOM(markup,{url:'https://sidework.example/onboarding/?journey=first',runScripts:'outside-only'});
 dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
 let saved={version:1,includeExamples:false,projects:existing,showcase:[],contributionDrafts:[]};let writes=0;
 const workspace={account:true,busy:false,read:()=>saved,save:async value=>{writes++;if(fail)throw new Error('Save failed. Try again.');saved=value;return saved;}};
 dom.window.dependencies={...imports,readState,fetchRepositories:async()=>repositories,openDraftWorkspace:async()=>workspace,connectFavorites:()=>null};
 dom.window.eval(`const {${Object.keys(dom.window.dependencies).join(',')}}=window.dependencies;${source}`);await tick();
 // General import needs an explicit search. The journey may load the signed-in handle automatically.
 if(!dom.window.document.querySelector('#repo-list input')) {dom.window.document.querySelector('#github-import-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await tick();}
 return {dom,saved:()=>saved,writes:()=>writes};
}

test('first-project chooser deliberately selects one repository and opens its saved story',async()=>{
 const {dom,saved,writes}=await chooser(),doc=dom.window.document;
 const choices=doc.querySelectorAll('#repo-list input');assert.equal(choices.length,2);
 assert.equal(choices[0].type,'radio');assert.equal(doc.querySelector('#import-selected').disabled,true);
 choices[0].click();choices[1].click();
 assert.equal(doc.querySelectorAll('#repo-list input:checked').length,1);
 doc.querySelector('#import-selected').click();await tick();
 assert.equal(writes(),1);assert.deepEqual(saved().projects.map(item=>item.id),['github-2']);
 assert.equal(dom.window.destination,'/workbench/?journey=first&project=github-2#editor');dom.window.close();
});

test('first-project chooser retains the selection on a failed account save',async()=>{
 const {dom,saved}=await chooser({fail:true}),doc=dom.window.document;
 doc.querySelector('#repo-list input').click();doc.querySelector('#import-selected').click();await tick();
 assert.match(doc.querySelector('#import-status').textContent,/Save failed/);assert.equal(saved().projects.length,0);
 assert.equal(doc.querySelector('#repo-list input').checked,true);assert.equal(dom.window.destination,undefined);assert.equal(doc.querySelector('#import-selected').disabled,false);dom.window.close();
});

test('clearing the guided selection returns keyboard focus to the visible repository search',async()=>{
 const {dom}=await chooser(),doc=dom.window.document;
 doc.querySelector('#repo-list input').click();
 doc.querySelector('#clear-selection').click();
 assert.equal(doc.querySelectorAll('#repo-list input:checked').length,0);
 assert.equal(doc.activeElement,doc.querySelector('#repo-search'));
 assert.equal(doc.querySelector('#select-matching').hidden,true);
 dom.window.close();
});

test('choosing an existing repository opens its authored saved story without replacing fields',async()=>{
 const existing={...repositories[0].project,id:'authored-id',description:'My authored story.',image:'https://example.com/screenshot.jpg'};
 const {dom,saved}=await chooser({existing:[existing]}),doc=dom.window.document;
 assert.equal(doc.querySelector('#repo-list input').disabled,false);doc.querySelector('#repo-list input').click();doc.querySelector('#import-selected').click();await tick();
 assert.equal(saved().projects.length,1);assert.equal(saved().projects[0].description,'My authored story.');assert.equal(dom.window.destination,'/workbench/?journey=first&project=authored-id#editor');dom.window.close();
});
