import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
import { createDraftWorkspace } from '../src/scripts/account-workspace.mjs';
import * as state from '../src/scripts/sidework-state.mjs';
import { withLatestContributionDrafts } from '../src/scripts/contribution-drafts.mjs';
import * as drafts from '../src/scripts/project-drafts.mjs';
import * as metadata from '../src/scripts/project-metadata.mjs';
import { browserDraftIdentity } from '../src/scripts/draft-identity.mjs';
import * as transfer from '../src/scripts/draft-transfer.mjs';
const read = file => readFileSync(new URL(file,import.meta.url),'utf8');
const script = stripTypeScriptTypes(read('../src/scripts/sidework.ts')).replace(/^import .*;$/gm,'');
const preview = stripTypeScriptTypes(read('../src/scripts/project-preview.ts')).replace(/^import .*;$/gm,'').replace('export function','function');
const composer = read('../src/components/ProjectComposer.astro').replace(/^---[\s\S]*?---/,'').replace(/<Icon\b[^>]*\/>/g,'');
async function editor(fresh = false, options = {}) {
  const seed={projects:[{id:'homeport',name:'Homeport',description:'A workspace.',url:'https://homeport.example'}],contributions:[],opportunities:[]};
  const ids=['feedback','project-list','project-count','project-empty','contribution-list','contribution-empty','more-contributions','recent-list','saved-count','submitted-count','week-hint','plan-empty','plan-list','week-slots','featured-count','showcase-empty','showcase-projects','export-showcase','copy-profile','export-work','refresh-github'];
  const panels=['projects','showcase','overview','contributions','discover','plan','connections'].map(id=>`<section class="sw-panel" id="${id}"><h2>${id}</h2></section>`).join('');
  const dom=new JSDOM(`<div id="sidework"><nav class="sw-rail"><a href="#projects" data-view="projects">Projects</a></nav><main id="main-content">${panels}${composer}${ids.map(id=>`<div id="${id}"></div>`).join('')}<button id="add-project">Add</button><input id="project-search"><input id="contribution-search"><select id="contribution-status"><option value="all">All</option></select><script type="application/json" id="sidework-seed">${JSON.stringify(seed)}</script></main></div>`,{url:'https://sidework.example/workbench/#projects',runScripts:'outside-only'});
  if(options.identity)dom.window.document.head.innerHTML=`<meta name="sidework-account" content="${options.identity.githubId}"><meta name="sidework-handle" content="${options.identity.handle}">`;
  dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
  for(const id of ['project-list','project-count','project-empty'])dom.window.document.querySelector('#projects').append(dom.window.document.getElementById(id));
  for(const id of ['showcase-projects','showcase-empty','featured-count','export-showcase'])dom.window.document.querySelector('#showcase').append(dom.window.document.getElementById(id));
  dom.window.confirm=()=>false;
  dom.window.Error=Error; // Imported dependencies throw in the Node realm.
  if (!fresh) dom.window.localStorage.setItem(state.STORAGE_KEY, JSON.stringify({version:1}));
  dom.window.dependencies={...state,...drafts,...transfer,...metadata,withLatestContributionDrafts,openDraftWorkspace:async()=>{const work=createDraftWorkspace({identity:options.identity,fetcher:options.fetcher,storage:dom.window.localStorage,key:state.STORAGE_KEY});await work.load();dom.workspace=work;return work;},browserDraftIdentity:()=>browserDraftIdentity(dom.window.document),setupAgentConnections:()=>{}};
  dom.window.eval(`const {${Object.keys(dom.window.dependencies).join(',')}}=window.dependencies;${preview}\n${script}`);
  await new Promise(resolve=>setImmediate(resolve));
  return dom;
}
const fill=(dom,name,value)=>{const input=dom.window.document.querySelector(`[name=${name}]`);input.value=value;input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const submit=async dom=>{dom.window.document.querySelector('#project-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await settle();};
test('editing saves a local copy and reopens the stored story without changing the seed',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('[data-edit-project]').click();fill(dom,'whyBuilt','A real need.');fill(dom,'name','My Homeport');await submit(dom);
  const saved=JSON.parse(dom.window.localStorage.getItem(state.STORAGE_KEY));assert.equal(saved.projects[0].whyBuilt,'A real need.');assert.equal(saved.projects[0].id,'homeport');
  assert.equal(doc.querySelectorAll('.sw-project-row').length,1);
  doc.querySelector('[data-edit-project]').click();assert.equal(doc.querySelector('[name=whyBuilt]').value,'A real need.');
  assert.equal(JSON.parse(doc.querySelector('#sidework-seed').textContent).projects[0].name,'Homeport');dom.window.close();
});
test('a storage failure keeps the editor open with the unsaved story intact',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('[data-edit-project]').click();fill(dom,'whyBuilt','Do not lose this.');
  Object.defineProperty(dom.window.Storage.prototype,'setItem',{value(){throw new Error('Storage full');}});
  await submit(dom);
  assert.equal(doc.querySelector('#editor').hidden,false);assert.equal(doc.querySelector('[name=whyBuilt]').value,'Do not lose this.');assert.equal(doc.querySelector('#draft-error').hidden,false);assert.equal(dom.window.localStorage.getItem(state.STORAGE_KEY),JSON.stringify({version:1}));dom.window.close();
});
test('cancel preserves unsaved edits when discard is rejected; preview text is not executable HTML',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('[data-edit-project]').click();fill(dom,'whyBuilt','<img src=x onerror="alert(1)">');
  doc.querySelector('#cancel-project').click();assert.equal(doc.querySelector('#editor').hidden,false);
  assert.match(doc.querySelector('#project-preview').textContent,/<img src=x/);assert.equal(doc.querySelector('#project-preview img'),null);dom.window.close();
});

test('workbench navigation does not cancel native editor disclosure clicks',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('[data-edit-project]').click();
  const summary=doc.querySelector('.sw-story-details summary');
  const click=new dom.window.MouseEvent('click',{bubbles:true,cancelable:true});
  summary.dispatchEvent(click);
  assert.equal(click.defaultPrevented,false);assert.equal(summary.parentElement.open,true);dom.window.close();
});

test('unfeaturing the final project keeps keyboard focus in the visible profile draft',async()=>{
  const dom=await editor(),doc=dom.window.document;
  dom.window.history.replaceState(null,'','#showcase');dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
  doc.querySelector('#showcase [data-feature-project]').click();await settle();
  assert.equal(doc.activeElement,doc.querySelector('#showcase h2'));
  assert.equal(doc.querySelector('#showcase-empty').hidden,false);dom.window.close();
});

test('moving to either end retains focus on the moved project in the profile draft',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('#add-project').click();fill(dom,'name','Second project');fill(dom,'url','https://second.example');fill(dom,'description','Another project.');await submit(dom);
  const second=doc.querySelector('#projects [data-feature-project]').dataset.featureProject;
  doc.querySelector('#projects [data-feature-project]').click();await settle();
  dom.window.history.replaceState(null,'','#showcase');dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
  for(const direction of ['-1','1']){
    const button=[...doc.querySelectorAll('#showcase [data-move-project]')].find(item=>item.dataset.moveProject===second&&item.dataset.direction===direction);
    button.click();await settle();assert.equal(doc.activeElement.dataset.editProject,second);assert.equal(doc.activeElement.closest('.sw-panel').id,'showcase');
  }
  doc.querySelector('#showcase [data-feature-project]').click();await settle();
  assert.equal(doc.activeElement.closest('.sw-panel').id,'showcase');assert.ok(doc.activeElement.dataset.editProject);dom.window.close();
});

test('a new workspace starts empty and saves only the project the user adds',async()=>{
 const dom=await editor(true),doc=dom.window.document;
 assert.equal(doc.querySelectorAll('.sw-project-row').length,0);
 assert.equal(doc.querySelector('#featured-count').textContent,'0 of 6 selected');
 doc.querySelector('#add-project').click();fill(dom,'name','My first project');fill(dom,'url','https://example.com/first');await submit(dom);
 const saved=JSON.parse(dom.window.localStorage.getItem(state.STORAGE_KEY));
 assert.equal(saved.includeExamples,false);assert.equal(saved.projects.length,1);
 assert.equal(doc.querySelectorAll('.sw-project-row').length,1);dom.window.close();
});


test('project metadata saves, previews, reopens, and rejects excessive features without losing edits',async()=>{
  const dom=await editor(),doc=dom.window.document;
  doc.querySelector('[data-edit-project]').click();
  fill(dom,'category','developer-tools');fill(dom,'softwareType','cli');fill(dom,'audience','Shell users');fill(dom,'features','Preview colors\nExport a theme');
  assert.match(doc.querySelector('#project-preview').textContent,/Developer tools.*Command-line tool/s);
  assert.match(doc.querySelector('#project-preview').textContent,/Shell users/);
  assert.equal(doc.querySelectorAll('.sw-story-features li').length,2);
  await submit(dom);
  const saved=JSON.parse(dom.window.localStorage.getItem(state.STORAGE_KEY));
  assert.deepEqual(saved.projects[0].features,['Preview colors','Export a theme']);
  doc.querySelector('[data-edit-project]').click();
  assert.equal(doc.querySelector('[name=features]').value,'Preview colors\nExport a theme');
  assert.equal(doc.querySelector('[name=category]').value,'developer-tools');
  fill(dom,'features','One\nTwo\nThree\nFour\nFive\nSix');await submit(dom);
  assert.equal(doc.querySelector('#editor').hidden,false);
  assert.match(doc.querySelector('#draft-error').textContent,/five features/);
  assert.equal(JSON.parse(dom.window.localStorage.getItem(state.STORAGE_KEY)).projects[0].features.length,2);
  dom.window.close();
});

test('signed-in project editor saves to the account, preserves browser originals, and removes featured IDs with a project',async()=>{
 let record={revision:0,updatedAt:null,drafts:{projects:[],showcase:[],contributionDrafts:[]}};
 const fetcher=async(url,options)=>{if(options.method==='PUT'){const value=JSON.parse(options.body);assert.equal(value.revision,record.revision);record={revision:record.revision+1,updatedAt:'2026-11-08T15:00:00Z',drafts:value.drafts};}return Response.json(record);};
 const dom=await editor(false,{identity:{githubId:'1234',handle:'@builder'},fetcher}),doc=dom.window.document;
 const original=dom.window.localStorage.getItem(state.STORAGE_KEY);
 assert.equal(doc.querySelectorAll('.sw-project-row').length,0);
 doc.querySelector('#add-project').click();fill(dom,'name','Private project');fill(dom,'url','https://example.com/private');await submit(dom);
 assert.equal(record.drafts.projects[0].name,'Private project');assert.equal(dom.window.localStorage.getItem(state.STORAGE_KEY),original);
 doc.querySelector('[data-feature-project]').click();await settle();assert.deepEqual(record.drafts.showcase,[record.drafts.projects[0].id]);
 doc.querySelector('[data-remove-project]').click();await settle();assert.deepEqual(record.drafts.projects,[]);assert.deepEqual(record.drafts.showcase,[]);
 dom.window.close();
});

test('a stale account save keeps the project form and offers all pending work for recovery',async()=>{
 const record={revision:1,updatedAt:'2026-11-08T15:00:00Z',drafts:{projects:[{id:'one',name:'Saved project',description:'Original text',url:'https://example.com/one'}],showcase:[],contributionDrafts:[]}};
 const fetcher=async(url,options)=>options.method==='PUT'?Response.json({error:'Conflict'},{status:409}):Response.json(record);
 const dom=await editor(true,{identity:{githubId:'1234',handle:'@builder'},fetcher}),doc=dom.window.document;
 doc.querySelector('[data-edit-project]').click();fill(dom,'description','Do not lose my changes.');await submit(dom);
 assert.equal(doc.querySelector('#editor').hidden,false);assert.equal(doc.querySelector('[name=description]').value,'Do not lose my changes.');
 assert.match(doc.querySelector('#draft-error').textContent,/changed elsewhere/);assert.equal(dom.workspace.recovery().drafts.projects[0].description,'Do not lose my changes.');
 assert.equal(record.drafts.projects[0].description,'Original text');dom.window.close();
});
