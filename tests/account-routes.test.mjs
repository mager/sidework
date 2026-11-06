import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import * as auth from '../src/lib/github-auth.mjs';
import * as legacy from '../src/lib/invite.mjs';
import { storageKey } from '../src/scripts/storage-key.mjs';
const config=auth.authConfiguration({SIDEWORK_ORIGIN:'https://sidework.example',GITHUB_CLIENT_ID:'test',GITHUB_CLIENT_SECRET:'test',SIDEWORK_SESSION_SECRET:'x'.repeat(64),DATABASE_URL:'postgresql://test.invalid/db'});
const oldConfig=legacy.configuration({SIDEWORK_SESSION_SECRET:config.secret,SIDEWORK_INVITE_HASHES:legacy.hashCode('test')});
function load(file, exported, dependencies) {
  const code=stripTypeScriptTypes(readFileSync(new URL(file,import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace(new RegExp(`export const ${exported}\\s*=`),'return');
  return new Function(...Object.keys(dependencies),code)(...Object.values(dependencies));
}
function context(path, values={}) {
  const written=new Map(), url=new URL(path,config.origin);
  return {url,locals:{},cookies:{get:name=>values[name] ? {value:values[name]} : undefined,set:(name,value,options)=>written.set(name,{value,options}),delete:name=>written.set(name,null)},written,redirect:(location,status)=>new Response(null,{status,headers:{Location:location}})};
}
test('waiting accounts cannot enter private routes even with a legacy cookie; account deletion and DB failure fail closed',async()=>{
  const values={[auth.ACCOUNT_COOKIE]:auth.createAccountSession('123',config),[legacy.COOKIE_NAME]:legacy.createSession(oldConfig.hashes[0],oldConfig)};
  let record={github_id:'123',status:'waiting'};
  let fail=false;
  const middleware=load('../src/middleware.ts','onRequest',{defineMiddleware:fn=>fn,...legacy,...auth,configuration:()=>oldConfig,authConfiguration:()=>config,accountStore:()=>({find:async()=>{if(fail)throw Error('offline');return record;}})});
  const run=async(path,cookies=values)=>middleware(context(path,cookies),async()=>new Response('page'));
  for(const path of ['/','/friends/','/settings/','/projects/cantalo/','/contributions/drafts/','/api/agent-token']) {
    const response=await run(path);assert.equal(response.status,303,path);assert.equal(response.headers.get('location'),'/waiting/');
  }
  for(const path of ['/waiting/','/mager/','/api/account/updates']) assert.equal((await run(path)).status,200,path);
  record={...record,status:'approved'};assert.equal((await run('/friends/')).status,200);
  record=null;assert.equal((await run('/friends/')).headers.get('location'),'/signup/');
  fail=true;assert.equal((await run('/friends/')).status,503);assert.equal((await run('/api/signout')).status,200);
  assert.equal((await run('/mager/')).status,200);
  assert.equal((await run('/api/mcp',{})).status,200); // MCP has separate bearer authorization.
  assert.equal((await run('/friends/',{})).headers.get('location'),'/signup/');
});
test('OAuth callback saves a waiting account before issuing its separate HTTP-only cookie',async()=>{
  const start=auth.beginGithubLogin(config,true), state=new URL(start.url).searchParams.get('state');
  let saves=0;
  const callback=load('../src/pages/auth/github/callback.ts','GET',{...auth,authConfiguration:()=>config,githubIdentity:async()=>({githubId:'123',login:'test-user',email:'test@example.com'}),accountStore:()=>({save:async(identity,updates)=>{saves++;assert.equal(updates,true);return {github_id:identity.githubId,status:'waiting'};}})});
  const ctx=context(`/auth/github/callback/?code=test&state=${state}`,{[auth.OAUTH_COOKIE]:start.cookie});
  assert.equal((await callback(ctx)).headers.get('location'),'/waiting/');
  assert.equal(saves,1);assert.equal(ctx.written.get(auth.OAUTH_COOKIE),null);
  const session=ctx.written.get(auth.ACCOUNT_COOKIE);
  assert.equal(auth.readAccountSession(session.value,config).sub,'123');
  assert.equal(session.options.httpOnly,true);assert.equal(session.options.secure,true);
  assert.equal(ctx.written.has(legacy.COOKIE_NAME),false);
  const bad=context('/auth/github/callback/?code=test&state=wrong',{[auth.OAUTH_COOKIE]:start.cookie});
  assert.equal((await callback(bad)).headers.get('location'),'/signup/?error=expired');assert.equal(saves,1);
});
test('OAuth callback never issues a session when account storage fails',async()=>{
  const start=auth.beginGithubLogin(config),state=new URL(start.url).searchParams.get('state');
  const callback=load('../src/pages/auth/github/callback.ts','GET',{...auth,authConfiguration:()=>config,githubIdentity:async()=>({githubId:'123'}),accountStore:()=>({save:async()=>{throw Error('offline');}})});
  const ctx=context(`/auth/github/callback/?code=test&state=${state}`,{[auth.OAUTH_COOKIE]:start.cookie});
  assert.equal((await callback(ctx)).headers.get('location'),'/signup/?error=retry');
  assert.equal(ctx.written.has(auth.ACCOUNT_COOKIE),false);
});
test('OAuth start rejects cross-origin posts and does not run without service configuration',async()=>{
  const start=load('../src/pages/auth/github/index.ts','POST',{...auth,authConfiguration:()=>config});
  const ctx=context('/auth/github/');ctx.request=new Request(ctx.url,{method:'POST',headers:{origin:'https://other.example','content-type':'application/x-www-form-urlencoded'},body:'updates=on'});
  assert.equal((await start(ctx)).status,403);assert.equal(ctx.written.size,0);
  const unavailable=load('../src/pages/auth/github/index.ts','POST',{...auth,authConfiguration:()=>({...config,ready:false})});
  ctx.request=new Request(ctx.url,{method:'POST',headers:{origin:config.origin,'content-type':'application/x-www-form-urlencoded'},body:''});
  assert.equal((await unavailable(ctx)).headers.get('location'),'/signup/?error=unavailable');
});
test('GitHub accounts use separate browser workspace keys without overwriting the old workspace',()=>{
  const base='sidework-workbench-v1';
  assert.equal(storageKey(base,''),base);
  assert.equal(storageKey(base,'123'),`${base}:github:123`);
  assert.notEqual(storageKey(base,'123'),storageKey(base,'456'));
  assert.equal(storageKey(base,'@name'),base);
});
