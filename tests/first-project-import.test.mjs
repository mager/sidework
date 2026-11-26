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
async function chooser({fail=false,existing=[],items=repositories,journey=true,collection='repositories',linked=false}={}) {
 const markup=`<main id="main"><form id="github-import-form"><input name="source" type="radio" value="repositories" checked><input name="source" type="radio" value="stars"><input id="github-handle" value="@builder"><button id="find-repos"><span id="find-repos-label"></span></button><button id="cancel-import" hidden></button></form><p id="import-status"></p><section id="repo-results" hidden><input id="repo-search"><label id="include-forks-control"><input id="include-forks" type="checkbox" checked></label><input id="include-archived" type="checkbox" checked><button id="select-matching"></button><button id="clear-selection"></button><p id="repo-count"></p><ul id="repo-list"></ul><button id="show-more"></button><div id="import-actions"><span id="selection-count"></span><button id="import-selected"></button></div></section><div id="import-result"><p id="import-result-text"></p><a></a></div><script id="import-seed" type="application/json">{"projects":[],"opportunityIds":[]}</script></main>`;
 const params=new URLSearchParams();if(journey)params.set('journey','first');if(linked)params.set('repo',items[0].fullName);
 const dom=new JSDOM(markup,{url:`https://sidework.example/onboarding/?${params}`,runScripts:'outside-only'});
 const controls=dom.window.document.createElement('div');
 controls.innerHTML='<label>Sort<select id="repo-sort"><option value="recent">Recently updated</option><option value="name">Name</option></select></label><button id="clear-filters" hidden>Clear filters</button><p id="selection-detail"></p><div id="repo-empty" hidden><h2 id="repo-empty-title"></h2><p id="repo-empty-text"></p></div>';
 dom.window.document.getElementById('repo-results').prepend(controls);
 dom.window.document.querySelector(`input[name="source"][value="${collection}"]`).checked=true;
 dom.window.document.getElementById('include-forks').checked=false;
 dom.window.document.getElementById('include-archived').checked=false;
 dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
 let saved={version:1,includeExamples:false,projects:existing,showcase:[],contributionDrafts:[]};let writes=0;
 const workspace={account:true,busy:false,read:()=>saved,save:async value=>{writes++;if(fail)throw new Error('Save failed. Try again.');saved=value;return saved;}};
 dom.window.dependencies={...imports,readState,fetchRepositories:async()=>items,fetchLinkedRepositories:async()=>({repositories:items,unavailable:[]}),openDraftWorkspace:async()=>workspace,connectFavorites:()=>null};
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

test('already imported repositories stay out of the picker and their authored fields are retained',async()=>{
 const existing={...repositories[0].project,id:'authored-id',description:'My authored story.',image:'https://example.com/screenshot.jpg'};
 const {dom,saved}=await chooser({existing:[existing]}),doc=dom.window.document;
 assert.deepEqual([...doc.querySelectorAll('#repo-list input')].map(input=>input.getAttribute('aria-label')),['builder/project-2']);
 assert.equal(saved().projects.length,1);assert.equal(saved().projects[0].description,'My authored story.');assert.equal(dom.window.destination,undefined);dom.window.close();
});

test('large accounts start with 25 recent repositories and search the entire collection',async()=>{
 const items=Array.from({length:135},(_,index)=>({...repositories[0],fullName:`builder/project-${index+1}`,updatedAt:new Date(Date.UTC(2026,0,index+1)).toISOString(),project:{...repositories[0].project,id:`github-${index+1}`,name:`Project ${index+1}`,source:`https://github.com/builder/project-${index+1}`,url:`https://github.com/builder/project-${index+1}`}}));
 const {dom}=await chooser({items,journey:false}),doc=dom.window.document;
 assert.equal(doc.querySelectorAll('#repo-list li').length,25);
 assert.equal(doc.querySelector('#repo-list strong').textContent,'builder/project-135');
 doc.querySelector('#show-more').click();assert.equal(doc.querySelectorAll('#repo-list li').length,50);
 const search=doc.querySelector('#repo-search');search.value='project-130';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.equal(doc.querySelectorAll('#repo-list li').length,1);assert.equal(doc.querySelector('#repo-list strong').textContent,'builder/project-130');
 doc.querySelector('#clear-filters').click();assert.equal(search.value,'');assert.equal(doc.querySelectorAll('#repo-list li').length,25);
 const sort=doc.querySelector('#repo-sort');sort.value='name';sort.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(doc.querySelector('#repo-list strong').textContent,'builder/project-1');dom.window.close();
});

test('bulk import removes saved repositories immediately and on a return visit',async()=>{
 const {dom,saved}=await chooser({journey:false}),doc=dom.window.document;
 doc.querySelector('#repo-list input').click();doc.querySelector('#import-selected').click();await tick();
 assert.equal(saved().projects.length,1);assert.equal(doc.querySelectorAll('#repo-list input').length,1);
 assert.equal(doc.querySelector('#repo-list strong').textContent,'builder/project-2');
 const returning=await chooser({journey:false,existing:saved().projects});
 assert.equal(returning.dom.window.document.querySelector('#repo-list strong').textContent,'builder/project-2');
 doc.querySelector('#repo-list input').click();doc.querySelector('#import-selected').click();await tick();
 assert.equal(doc.querySelectorAll('#repo-list li').length,0);assert.equal(doc.querySelector('#repo-empty').hidden,false);assert.match(doc.querySelector('#repo-empty-title').textContent,/already added/i);
 returning.dom.window.close();dom.window.close();
});

test('bulk selection survives filtering and reports selections outside the results',async()=>{
 const {dom,saved}=await chooser({journey:false}),doc=dom.window.document;
 doc.querySelector('#repo-list input').click();
 const search=doc.querySelector('#repo-search');search.value='project-2';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.match(doc.querySelector('#selection-detail').textContent,/1.*outside/i);
 doc.querySelector('#repo-list input').click();assert.match(doc.querySelector('#selection-count').textContent,/2 selected/);
 doc.querySelector('#import-selected').click();await tick();assert.equal(saved().projects.length,2);assert.equal(doc.querySelectorAll('#repo-list li').length,0);dom.window.close();
});

test('clearing a bulk selection with no matching results focuses the search field',async()=>{
 const {dom}=await chooser({journey:false}),doc=dom.window.document;
 doc.querySelector('#repo-list input').click();
 const search=doc.querySelector('#repo-search');search.value='nothing-matches';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 doc.querySelector('#clear-selection').click();
 assert.equal(doc.activeElement,search);dom.window.close();
});

test('a renamed imported repository is hidden by its numeric identity and stars remain browsable',async()=>{
 const existing={...repositories[0].project,source:'https://github.com/builder/previous-name'};
 const picker=await chooser({existing:[existing]});
 assert.equal(picker.dom.window.document.querySelectorAll('#repo-list input').length,1);picker.dom.window.close();
 const stars=await chooser({existing:[existing],journey:false,collection:'stars'});
 assert.equal(stars.dom.window.document.querySelectorAll('#repo-list li').length,2);assert.equal(stars.dom.window.document.querySelector('#import-actions').hidden,true);stars.dom.window.close();
});

test('explicit repository links reveal archived forks instead of hiding the selected project',async()=>{
 const items=[{...repositories[0],fork:true,archived:true}];
 const {dom}=await chooser({items,linked:true,journey:false}),doc=dom.window.document;
 assert.equal(doc.querySelectorAll('#repo-list input').length,1);
 assert.equal(doc.querySelector('#repo-list input').checked,true);
 assert.equal(doc.querySelector('#repo-empty').hidden,true);dom.window.close();
});

test('search accepts a pasted GitHub URL and combinations of name and language',async()=>{
 const {dom}=await chooser({journey:false}),doc=dom.window.document;
 const search=doc.querySelector('#repo-search');
 for(const value of ['https://github.com/builder/project-2/','project-2 TypeScript']) {
  search.value=value;search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  assert.equal(doc.querySelectorAll('#repo-list li').length,1);
  assert.equal(doc.querySelector('#repo-list strong').textContent,'builder/project-2');
 }
 dom.window.close();
});
