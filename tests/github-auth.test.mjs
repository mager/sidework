import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { authConfiguration, beginGithubLogin, readOauthState, createAccountSession, readAccountSession, githubIdentity, accountAccess, readForm, ACCOUNT_SECONDS } from '../src/lib/github-auth.mjs';
import { issueAccountAgentToken, authorizeAgentRequest } from '../src/lib/agent-auth.mjs';
const now = 1800000000000;
const config = authConfiguration({SIDEWORK_ORIGIN:'https://sidework.example', GITHUB_CLIENT_ID:'test-client', GITHUB_CLIENT_SECRET:'test-secret', SIDEWORK_SESSION_SECRET:'x'.repeat(64), GCP_PROJECT_ID:'test-project',GCP_PROJECT_NUMBER:'123',GCP_SERVICE_ACCOUNT_EMAIL:'test@test-project.iam.gserviceaccount.com',GCP_WORKLOAD_IDENTITY_POOL_ID:'test-pool',GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID:'test-provider'});

test('GitHub setup fails closed; production HTTP origins are rejected', () => {
  assert.equal(config.ready,true);
  assert.equal(authConfiguration().ready,false);
  assert.equal(authConfiguration({SIDEWORK_ORIGIN:'http://example.com'}).origin,'');
  assert.throws(()=>beginGithubLogin({...config,ready:false}));
});
test('OAuth uses a browser-bound expiring state and S256 PKCE with only email scope', () => {
  const start = beginGithubLogin(config,true,now), url = new URL(start.url);
  const flow = readOauthState(start.cookie,url.searchParams.get('state'),config,now);
  assert.ok(flow); assert.equal(flow.updates,true);
  assert.equal(url.searchParams.get('scope'),'user:email');
  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.get('code_challenge'),createHash('sha256').update(flow.verifier).digest('base64url'));
  for (const [cookie,state,cfg,time] of [[start.cookie,'wrong',config,now],[start.cookie+'x',flow.state,config,now],[start.cookie,flow.state,config,now+600000],[start.cookie,flow.state,{...config,origin:'https://other.example'},now]]) assert.equal(readOauthState(cookie,state,cfg,time),null);
  assert.equal(readAccountSession(start.cookie,config,now),null);
});
test('account sessions bind immutable IDs to origin, expire and cannot grant access by themselves', () => {
  const token = createAccountSession('17733',config,now);
  assert.equal(readAccountSession(token,config,now).sub,'17733');
  assert.equal(readAccountSession(token+'x',config,now),null);
  assert.equal(readAccountSession(token,config,now+ACCOUNT_SECONDS*1000),null);
  assert.equal(readAccountSession(token,{...config,origin:'https://other.example'},now),null);
  assert.equal(accountAccess({status:'waiting'},true),false);
  assert.equal(accountAccess({status:'approved'}),true);
  assert.equal(accountAccess(null,false),false);
});
test('GitHub identity uses the authenticated user and a verified email, without retaining tokens', async () => {
  const calls=[];
  const fetcher=async(url,options)=>{
    calls.push({url,options});
    return Response.json(url.endsWith('access_token') ? {access_token:'test-provider-token'} : url.endsWith('/emails') ? [{email:'unverified@example.com',primary:true,verified:false},{email:'verified@example.com',verified:true,primary:false}] : {id:17733,login:'mager'});
  };
  const identity=await githubIdentity('code','verifier',config,fetcher);
  assert.deepEqual(identity,{githubId:'17733',login:'mager',email:'verified@example.com'});
  assert.equal(new URLSearchParams(calls[0].options.body).get('code_verifier'),'verifier');
  assert.equal(calls[1].options.headers.Authorization,'Bearer test-provider-token');
  await assert.rejects(githubIdentity('code','verifier',config,async(url)=>Response.json(url.endsWith('access_token') ? {access_token:'token'} : url.endsWith('/emails') ? [] : {id:17733,login:'mager'})),/verified-email-required/);
  await assert.rejects(githubIdentity('code','verifier',config,async()=>new Response('',{status:503})),/GitHub request failed/);
});
test('form bodies enforce the limit even without a content-length header', async () => {
  const request=body=>new Request('https://sidework.example/auth/github/',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  assert.equal((await readForm(request('updates=on'))).get('updates'),'on');
  await assert.rejects(readForm(request('x'.repeat(2049))),/too large/);
});
test('account agent tokens require approval on issue and on every request', async () => {
  const time=Date.now(), session={sub:'17733',exp:Math.floor(time/1000)+3600}, account={github_id:'17733',login:'mager',status:'approved'};
  const agentConfig={secret:config.secret,ready:false,hashes:[],findAccount:async()=>account};
  const {token}=issueAccountAgentToken(session,account,agentConfig,config.origin,time);
  const request=new Request(config.origin+'/api/mcp',{method:'POST',headers:{authorization:`Bearer ${token}`}});
  assert.equal(await authorizeAgentRequest(request,agentConfig),null);
  assert.equal((await authorizeAgentRequest(request,{...agentConfig,findAccount:async()=>({...account,status:'waiting'})})).status,401);
  assert.equal((await authorizeAgentRequest(request,{...agentConfig,findAccount:async()=>{throw Error('offline');}})).status,503);
  assert.equal((await authorizeAgentRequest(request,{...agentConfig,findAccount:undefined})).status,401);
  assert.throws(()=>issueAccountAgentToken(session,{...account,status:'waiting'},agentConfig,config.origin,time));
  assert.throws(()=>issueAccountAgentToken({...session,sub:'different'},account,agentConfig,config.origin,time));
});
