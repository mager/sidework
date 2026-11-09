import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import * as admin from '../src/lib/admin.mjs';
import { adminConfiguration, isAdminOwner, beginAdminLogin, readAdminFlow, createAdminSession, readAdminSession, issueAdminTicket, consumeAdminTicket, filterAccounts } from '../src/lib/admin.mjs';
import { createAccountSession, readAccountSession, beginGithubLogin, readOauthState } from '../src/lib/github-auth.mjs';

const now = 1800000000000;
const config = adminConfiguration({SIDEWORK_ORIGIN:'https://sidework.example',SIDEWORK_ADMIN_ORIGIN:'https://admin.example',SIDEWORK_ADMIN_SESSION_SECRET:'a'.repeat(64),SIDEWORK_OWNER_GITHUB_ID:'17733'});
const owner = {github_id:'17733',login:'mager',status:'approved'};
function database() {
 const records = new Map();
 return {records, collection:()=>({doc:id=>({id,create:async data=>records.set(id,data)})}),runTransaction:async fn=>fn({get:async ref=>({exists:records.has(ref.id),data:()=>records.get(ref.id)}),delete:ref=>records.delete(ref.id)})};
}
test('admin access requires the approved immutable owner ID; legacy access is insufficient',()=>{
 assert.equal(isAdminOwner(owner,config),true);
 for(const account of [null,{...owner,github_id:'2'},{...owner,status:'waiting'},{login:'mager',status:'approved'}]) assert.equal(isAdminOwner(account,config),false);
 assert.equal(adminConfiguration({SIDEWORK_ADMIN_ORIGIN:'http://evil.example'}).ready,false);
 assert.equal(adminConfiguration({...process.env,SIDEWORK_OWNER_GITHUB_ID:''}).ready,false);
});
test('admin cookies have separate purposes, origins, signatures and short expiration',()=>{
 const flow=beginAdminLogin(config,now), session=createAdminSession(owner,config,now);
 assert.equal(readAdminFlow(flow.cookie,flow.state,config,now).verifier,flow.verifier);
 assert.equal(readAdminFlow(flow.cookie,'wrong',config,now),null);
 assert.equal(readAdminFlow(flow.cookie,flow.state,config,now+600000),null);
 assert.equal(readAdminSession(session,config,now).sub,owner.github_id);
 for(const [value,cfg,time] of [[flow.cookie,config,now],[session+'x',config,now],[session,{...config,origin:config.mainOrigin},now],[session,config,now+admin.ADMIN_SECONDS*1000]]) assert.equal(readAdminSession(value,cfg,time),null);
});
test('handoff codes are owner-only, browser-bound, single-use, and expire',async()=>{
 const db=database(),flow=beginAdminLogin(config,now);
 await assert.rejects(issueAdminTicket({...owner,github_id:'2'},flow,config,db,now));
 const code=await issueAdminTicket(owner,flow,config,db,now);
 assert.equal(db.records.has(code),false);
 assert.equal(await consumeAdminTicket(code,{...flow,verifier:'wrong'},config,db,now),null);
 assert.equal(await consumeAdminTicket(code,flow,config,db,now),owner.github_id);
 assert.equal(await consumeAdminTicket(code,flow,config,db,now),null);
 const expired=await issueAdminTicket(owner,flow,config,db,now);
 assert.equal(await consumeAdminTicket(expired,flow,config,db,now+60000),null);
 const wrongOrigin=await issueAdminTicket(owner,flow,config,db,now);
 assert.equal(await consumeAdminTicket(wrongOrigin,flow,{...config,origin:'https://other.example'},db,now),null);
});
test('signup filters match handles, email, status, and explicit consent',()=>{
 const records=[{login:'mager',email:'owner@example.com',status:'approved',email_updates:false},{login:'builder',email:'builder@example.com',status:'waiting',email_updates:true}];
 assert.equal(filterAccounts(records,{q:'@MAGER'})[0].login,'mager');
 assert.equal(filterAccounts(records,{q:'builder@',status:'waiting',updates:'yes'}).length,1);
 assert.equal(filterAccounts(records,{updates:'no'})[0].login,'mager');
 assert.equal(filterAccounts(records,{q:'missing'}).length,0);
});
test('valid but incorrect browser proofs cannot consume or destroy a handoff',async()=>{
 const db=database(),flow=beginAdminLogin(config,now),other=beginAdminLogin(config,now);
 const code=await issueAdminTicket(owner,flow,config,db,now);
 const recordKey=createHash('sha256').update(code).digest('base64url');
 assert.equal(db.records.has(recordKey),true);
 for(const proof of [{...flow,verifier:other.verifier},{...flow,state:other.state},other]) {
  assert.equal(await consumeAdminTicket(code,proof,config,db,now),null);
  assert.equal(db.records.has(recordKey),true);
 }
 assert.equal(await consumeAdminTicket(code,flow,{...config,ownerId:'2'},db,now),null);
 assert.equal(await consumeAdminTicket(code,flow,config,db,now-1),null);
 assert.equal(await consumeAdminTicket(code,flow,config,db,now+59999),owner.github_id);
 assert.equal(db.records.has(recordKey),false);
});
test('account, OAuth, admin flow, and admin session cookies cannot be exchanged even with the same secret and origin',()=>{
 const auth={...config,ready:true,clientId:'test-client'};
 const account=createAccountSession(owner.github_id,auth,now);
 const oauth=beginGithubLogin(auth,false,now);
 const adminFlow=beginAdminLogin(config,now);
 const adminSession=createAdminSession(owner,config,now);
 for(const value of [account,oauth.cookie,adminFlow.cookie]) assert.equal(readAdminSession(value,config,now),null);
 for(const value of [account,oauth.cookie,adminSession]) assert.equal(readAdminFlow(value,adminFlow.state,config,now),null);
 for(const value of [adminSession,adminFlow.cookie]) {
  assert.equal(readAccountSession(value,auth,now),null);
  assert.equal(readOauthState(value,adminFlow.state,auth,now),null);
 }
 assert.equal(readAdminSession(adminSession,{...config,ownerId:'2'},now),null);
 assert.throws(()=>createAdminSession({...owner,status:'waiting'},config,now));
});
test('admin middleware checks approval on every request and rejects other routes and origins',async()=>{
 const source=stripTypeScriptTypes(readFileSync(new URL('../src/lib/admin-middleware.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export async function adminRequest','return async function adminRequest');
 let account=owner,fail=false,reads=0;
 const dependencies={...admin,adminConfiguration:()=>config,authConfiguration:()=>({}),accountStore:()=>({find:async id=>{reads++;assert.equal(id,owner.github_id);if(fail)throw Error('offline');return account;}})};
 const middleware=new Function(...Object.keys(dependencies),source)(...Object.values(dependencies));
 const cookie=createAdminSession(owner,config);
 const run=(path='/admin/',value=cookie,origin=config.origin)=>middleware({url:new URL(path,origin),locals:{},cookies:{get:name=>name===admin.ADMIN_COOKIE && value ? {value} : undefined},redirect:(location,status)=>new Response(null,{status,headers:{Location:location}}),rewrite:async()=>new Response('rewritten')},async()=>new Response('private page'));
 assert.equal((await run()).status,200);
 account={...owner,status:'waiting'};assert.equal((await run()).status,403);
 account={...owner,github_id:'2'};assert.equal((await run()).status,403);
 account=null;assert.equal((await run()).status,403);
 fail=true;assert.equal((await run()).status,503);
 assert.equal(reads,5);
 assert.equal((await run('/admin/','')).headers.get('location'),'/admin/login/');
 assert.equal((await run('/admin/',cookie,'https://preview.example')).status,503);
 for(const path of ['/friends/','/api/mcp','/auth/github/','/admin/connect/']) assert.equal((await run(path)).status,404);
 assert.equal(reads,5);
});

test('admin return visits renew an owner session and skip the login page without GitHub',async()=>{
 const source=stripTypeScriptTypes(readFileSync(new URL('../src/lib/admin-middleware.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export async function adminRequest','return async function adminRequest');
 let account=owner,fail=false;
 const dependencies={...admin,adminConfiguration:()=>config,authConfiguration:()=>({}),accountStore:()=>({find:async()=>{if(fail)throw Error('offline');return account;}})};
 const middleware=new Function(...Object.keys(dependencies),source)(...Object.values(dependencies));
 const cookie=createAdminSession(owner,config,Date.now()-5*3600000);
 const run=async(path='/admin/login/',value=cookie)=>{const writes=[];const response=await middleware({url:new URL(path,config.origin),locals:{},cookies:{get:()=>({value}),set:(...args)=>writes.push(args)},redirect:(location,status)=>new Response(null,{status,headers:{Location:location}})},async()=>new Response('page'));return {response,writes};};
 let result=await run();assert.equal(result.response.headers.get('location'),'/');assert.equal(result.writes.length,1);assert.equal(result.writes[0][2].maxAge,8*3600);
 result=await run('/admin/access/');assert.equal(result.response.status,200);
 account={...owner,status:'waiting'};result=await run();assert.equal(result.response.status,403);assert.equal(result.writes.length,0);
 fail=true;result=await run();assert.equal(result.response.status,503);assert.equal(result.writes.length,0);
 result=await run('/admin/login/',createAdminSession(owner,config,Date.now()-9*3600000));assert.equal(result.response.status,200);assert.equal(result.writes.length,0);
});
