import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { JSDOM } from 'jsdom';
const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
const markup=read('../src/components/AgentConnections.astro').replace(/^---[\s\S]*?---/,'').replace(/<Icon\b[^>]*\/>/g,'');
const script=stripTypeScriptTypes(read('../src/scripts/agent-connections.ts')).replace('export function','function');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
  const dom=new JSDOM(markup,{url:'https://sidework.example/workbench/#agents',runScripts:'outside-only'});
  Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Blocked');}}});
  dom.window.fetch=async()=>({ok:true,redirected:false,json:async()=>({token:'test-token-not-a-credential',expiresAt:'2026-11-05T00:00:00Z'})});
  dom.window.eval(`${script};setupAgentConnections();`);return dom;
}
test('blocked token and config copies reveal the exact text with focus and selection',async()=>{
  const dom=setup(),doc=dom.window.document;
  doc.querySelector('#create-agent-token').click();await settle();
  for(const id of ['copy-agent-token','copy-agent-config']){
    doc.getElementById(id).click();await settle();
    const field=doc.querySelector('#agent-copy-text');assert.equal(doc.querySelector('#agent-copy-fallback').hidden,false);assert.equal(doc.activeElement,field);assert.equal(field.selectionStart,0);assert.equal(field.selectionEnd,field.value.length);
    if(id==='copy-agent-config'){const value=JSON.parse(field.value);assert.equal(value.mcpServers.sidework.url,'https://sidework.example/api/mcp');assert.equal(value.mcpServers.sidework.headers.Authorization,'Bearer test-token-not-a-credential');}
    else assert.equal(field.value,'test-token-not-a-credential');
    doc.querySelector('#hide-agent-copy').click();assert.equal(field.value,'');assert.equal(doc.querySelector('#agent-copy-fallback').hidden,true);
  }
  assert.equal(dom.window.localStorage.length,0);dom.window.close();
});
test('an expired invitation reports recovery and restores the create control',async()=>{
  const dom=setup(),doc=dom.window.document;dom.window.fetch=async()=>({redirected:true});
  doc.querySelector('#create-agent-token').click();await settle();
  assert.match(doc.querySelector('#agent-token-status').textContent,/Reload Sidework/);assert.equal(doc.querySelector('#create-agent-token').disabled,false);assert.equal(doc.querySelector('#agent-token-result').hidden,true);dom.window.close();
});

test('the story task can be copied before connecting and its manual fallback returns focus to the task',async()=>{
  const dom=setup(),doc=dom.window.document;
  const button=doc.querySelector('#copy-agent-story');
  assert.ok(button,'a story prompt copy action is available');
  button.click();await settle();
  const field=doc.querySelector('#agent-copy-text');
  assert.equal(field.value,doc.querySelector('#agent-story-task').textContent.trim());
  assert.match(field.value,/Help me tell the story/);
  assert.match(field.value,/motivation/);
  assert.match(field.value,/learning/);
  assert.match(field.value,/review link/i);
  assert.equal(doc.activeElement,field);
  assert.equal(field.selectionEnd,field.value.length);
  assert.doesNotMatch(doc.querySelector('#agent-token-status').textContent,/tokens/i);
  doc.querySelector('#hide-agent-copy').click();
  assert.equal(field.value,'');
  assert.equal(doc.activeElement,button);
  assert.equal(doc.querySelector('#agent-token-result').hidden,true);
  assert.equal(dom.window.localStorage.length,0);dom.window.close();
});

test('successful story task copy clears any previous private copy fallback',async()=>{
  const dom=setup(),doc=dom.window.document;
  doc.querySelector('#create-agent-token').click();await settle();
  doc.querySelector('#copy-agent-token').click();await settle();
  let copied='';dom.window.navigator.clipboard.writeText=async text=>{copied=text;};
  const button=doc.querySelector('#copy-agent-story');assert.ok(button);
  button.click();await settle();
  assert.equal(copied,doc.querySelector('#agent-story-task').textContent.trim());
  assert.equal(doc.querySelector('#agent-copy-text').value,'');
  assert.equal(doc.querySelector('#agent-copy-fallback').hidden,true);
  assert.match(doc.querySelector('#agent-token-status').textContent,/task copied/i);
  dom.window.close();
});
