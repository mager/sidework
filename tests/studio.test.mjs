import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {JSDOM} from 'jsdom';
const keyScript=readFileSync(new URL('../src/scripts/storage-key.mjs',import.meta.url),'utf8').replace('export function','function');
const script=keyScript+'\n'+stripTypeScriptTypes(readFileSync(new URL('../src/scripts/studio.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
function studio(saved='[]',url='https://sidework.example') {
 const dom=new JSDOM(`<button data-save-project="homeport"><span>Save</span></button><button data-save-project="perch"><span>Save</span></button><span id="saved-count"></span><div id="saved-project-list"></div><button id="follow-maker"></button><button id="studio-theme"></button><p id="studio-feedback" hidden></p><script id="studio-project-data" type="application/json">[{"id":"homeport","name":"Homeport","tagline":"Keep your work."},{"id":"perch","name":"Perch","tagline":"A quiet lookout."}]</script>`,{url,runScripts:'outside-only'});
 dom.window.localStorage.setItem('sidework-collection-v1',saved);dom.window.eval(script);return dom;
}
test('saved collection recovers from malformed storage and ignores unknown IDs',()=>{
 for(const [raw,count] of [['not-json','0'],['{"homeport":true}','0'],['["homeport","homeport","unknown",null]','1']]) {
  const dom=studio(raw);assert.equal(dom.window.document.querySelector('#saved-count').textContent,count);dom.window.close();
 }
});
test('saving survives a new page and unsaving removes the collection link',()=>{
 const first=studio();first.window.document.querySelector('[data-save-project="homeport"]').click();
 const state=first.window.localStorage.getItem('sidework-collection-v1');first.window.close();
 const next=studio(state);const button=next.window.document.querySelector('[data-save-project="homeport"]');
 assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(next.window.document.querySelector('#saved-project-list a').getAttribute('href'),'/projects/homeport/');
 button.click();assert.equal(next.window.document.querySelector('#saved-count').textContent,'0');assert.equal(next.window.document.querySelector('#saved-project-list a'),null);next.window.close();
});
test('follow state explains its local-only behavior',()=>{
 const dom=studio();dom.window.document.querySelector('#follow-maker').click();
 assert.equal(dom.window.localStorage.getItem('sidework-follow-mager'),'true');assert.match(dom.window.document.querySelector('#studio-feedback').textContent,/in this browser/);dom.window.close();
});
test('saving stays usable when browser storage rejects writes',()=>{
 const dom=studio();Object.defineProperty(dom.window.Storage.prototype,'setItem',{value(){throw new Error('Storage unavailable');}});
 dom.window.document.querySelector('[data-save-project="perch"]').click();
 assert.equal(dom.window.document.querySelector('#saved-count').textContent,'1');assert.match(dom.window.document.querySelector('#studio-feedback').textContent,/this visit/);dom.window.close();
});

test('saved projects use detail routes from the profile and other detail pages',()=>{
 for (const path of ['/mager/', '/projects/homeport/', '/settings/']) {
  const dom=studio('["perch"]',`https://sidework.example${path}`);
  assert.equal(dom.window.document.querySelector('#saved-project-list a').getAttribute('href'),'/projects/perch/');dom.window.close();
 }
});
