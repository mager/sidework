import test from 'node:test';
import assert from 'node:assert/strict';
import { exportShowcase } from '../src/scripts/project-drafts.mjs';
import { parseProfileDraft, mergeProfileDraft, decodeReviewLink } from '../src/scripts/draft-transfer.mjs';
import { prepareDraft, createAgentServer } from '../src/lib/agent-server.mjs';
import { issueAccountAgentToken } from '../src/lib/agent-auth.mjs';
import { handleAgentRequest } from '../src/lib/agent-http.mjs';
import { browserDraftIdentity } from '../src/scripts/draft-identity.mjs';
import { JSDOM } from 'jsdom';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const identity={githubId:'1234',handle:'@builder'};
const project={id:'one',name:'One',description:'A tool.',url:'https://one.example'};
const state={projects:[project],showcase:['one'],plan:{},contributionDrafts:[]};
const origin='https://sidework.example';

test('browser draft identity uses server-rendered account metadata and fails closed when incomplete',()=>{
  const dom=new JSDOM('<meta name="sidework-account" content="1234"><meta name="sidework-handle" content="@builder">');
  assert.deepEqual(browserDraftIdentity(dom.window.document),identity);
  dom.window.document.querySelector('[name="sidework-handle"]').remove();
  assert.throws(()=>browserDraftIdentity(dom.window.document),/account identity/);
  dom.window.document.querySelector('[name="sidework-account"]').remove();
  assert.equal(browserDraftIdentity(dom.window.document),null);
  dom.window.close();
});

test('account exports and review links bind to a numeric ID, including after a rename',async()=>{
  const exported=exportShowcase(state,[project],[],identity);
  assert.equal(exported.version,2);
  assert.equal(exported.githubId,identity.githubId);
  assert.equal(exported.handle,identity.handle);
  const renamed={...identity,handle:'@renamed'};
  assert.equal(parseProfileDraft(exported,renamed).handle,'@renamed');
  const prepared=prepareDraft([project],origin,identity);
  const decoded=await decodeReviewLink(new URL(prepared.reviewUrl).hash.slice(8),identity);
  assert.equal(decoded.githubId,identity.githubId);
  assert.deepEqual(mergeProfileDraft(state,decoded,[],identity).showcase,['one']);
});

test('foreign and malformed identities fail before a merge; legacy backups remain limited to their owner',()=>{
  const draft=exportShowcase(state,[project],[],identity);
  const before=structuredClone(state);
  for(const changed of [{...identity,githubId:'9999'},null]) {
    assert.throws(()=>mergeProfileDraft(state,draft,[],changed),/account/);
  }
  assert.deepEqual(state,before);
  assert.throws(()=>exportShowcase(state,[project],[],{githubId:'bad',handle:'@builder'}),/account/);
  const legacy=exportShowcase(state,[project],[]);
  assert.equal(legacy.version,1);
  assert.equal(parseProfileDraft(legacy,{githubId:'17733',handle:'@renamed-owner'}).handle,'@renamed-owner');
  assert.throws(()=>parseProfileDraft(legacy,identity),/account/);
  assert.throws(()=>parseProfileDraft({...draft,githubId:undefined},identity),/account/);
});

test('MCP drafts use the current authenticated account, not prompt input or the public example',async()=>{
  let account={github_id:identity.githubId,login:'builder',status:'approved'};
  const config={secret:'x'.repeat(64),ready:false,hashes:[],findAccount:async()=>account};
  const issued=issueAccountAgentToken({sub:account.github_id,exp:Math.floor(Date.now()/1000)+3600},account,config,origin);
  const transport=new StreamableHTTPClientTransport(new URL(origin+'/api/mcp'),{requestInit:{headers:{Authorization:`Bearer ${issued.token}`}},fetch:async(input,init)=>handleAgentRequest(new Request(input,init),config,(current)=>createAgentServer({identity:current,projects:[],contributions:[],opportunities:[],origin}))});
  const client=new Client({name:'identity-test',version:'1'});
  try {
    await client.connect(transport);
    const prepared=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}});
    assert.equal(prepared.structuredContent.draft.githubId,identity.githubId);
    assert.equal(prepared.structuredContent.draft.handle,'@builder');
    const profile=await client.callTool({name:'get_profile',arguments:{}});
    assert.deepEqual(profile.structuredContent.draftTarget,identity);
    assert.equal(profile.structuredContent.handle,'@mager');
    const prompt=await client.getPrompt({name:'setup_profile',arguments:{handle:'@someone-else'}});
    assert.match(prompt.messages[0].content.text,/@builder/);
    account={...account,login:'renamed'};
    const renamed=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}});
    assert.equal(renamed.structuredContent.draft.handle,'@renamed');
    account={...account,login:undefined};
    await assert.rejects(client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}}));
    account={...account,login:'renamed',github_id:'9999'};
    await assert.rejects(client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}}));
    account={...account,github_id:identity.githubId};
    account={...account,status:'waiting'};
    await assert.rejects(client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}}));
  } finally {await client.close();}
});
