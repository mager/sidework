import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { hashCode, createSession, validSession } from '../src/lib/invite.mjs';
import { issueAgentToken, verifyAgentToken, AGENT_SECONDS } from '../src/lib/agent-auth.mjs';
import { handleAgentRequest } from '../src/lib/agent-http.mjs';
import { createAgentServer, prepareDraft } from '../src/lib/agent-server.mjs';
import { decodeReviewLink, parseProfileDraft, mergeProfileDraft } from '../src/scripts/draft-transfer.mjs';

const origin='https://sidework.example';
const config={ready:true,hashes:[hashCode('test-invitation')],secret:'a-test-secret-with-more-than-thirty-two-characters'};
const project={id:'one',name:'One',description:'A useful tool.',url:'https://one.example',source:'https://github.com/mager/one'};
const session=()=>createSession(config.hashes[0],config);
const token=()=>issueAgentToken(session(),config,origin).token;
const makeServer=()=>createAgentServer({projects:[project],contributions:[{title:'A fix',repository:'test/repo',status:'draft',checkedAt:'2026-11-04'}],opportunities:[{title:'A keyboard fix',skill:'Accessibility',language:'CSS',repository:'test/repo'}],origin,fetcher:async()=>Response.json([{id:10,name:'public',full_name:'mager/public',private:false,html_url:'https://github.com/mager/public'},{id:11,name:'private',full_name:'mager/private',private:true,html_url:'https://github.com/mager/private'}])});

test('agent tokens are scoped, audience bound, expiring, and separate from invitation cookies',()=>{
  const now=Date.now(),cookie=createSession(config.hashes[0],config,now),issued=issueAgentToken(cookie,config,origin,now);
  assert.ok(verifyAgentToken(issued.token,config,origin,now));
  assert.equal(validSession(issued.token,config,now),false);
  assert.equal(verifyAgentToken(cookie,config,origin,now),null);
  assert.equal(verifyAgentToken(issued.token+'x',config,origin,now),null);
  assert.equal(verifyAgentToken(issued.token,config,'https://elsewhere.example',now),null);
  assert.equal(verifyAgentToken(issued.token,config,origin,now+AGENT_SECONDS*1000),null);
  assert.equal(verifyAgentToken(issued.token,{...config,hashes:[]},origin,now),null);
  assert.equal(verifyAgentToken(issued.token,{...config,secret:'another-secret'},origin,now),null);
  assert.throws(()=>issueAgentToken('bad-session',config,origin));
});

test('MCP rejects anonymous, cookie-only, wrong-origin, oversized, and invalid JSON requests',async()=>{
  const request=(headers={},body='{}')=>new Request(origin+'/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',...headers},body});
  assert.equal((await handleAgentRequest(request(),config,makeServer)).status,401);
  assert.equal((await handleAgentRequest(request({Cookie:`sidework-access=${session()}`}),config,makeServer)).status,401);
  const auth={Authorization:`Bearer ${token()}`};
  assert.equal((await handleAgentRequest(request({...auth,Origin:'https://attacker.example'}),config,makeServer)).status,403);
  assert.equal((await handleAgentRequest(request(auth,'x'.repeat(100001)),config,makeServer)).status,413);
  assert.equal((await handleAgentRequest(request(auth,'not-json'),config,makeServer)).status,400);
  assert.equal((await handleAgentRequest(request({...auth,'Content-Type':'text/plain'}),config,makeServer)).status,415);
});

test('official MCP client initializes, reads tools/resources/prompts, and prepares a review without saving',async()=>{
  const transport=new StreamableHTTPClientTransport(new URL(origin+'/api/mcp'),{requestInit:{headers:{Authorization:`Bearer ${token()}`}},fetch:async(input,init)=>handleAgentRequest(new Request(input,init),config,makeServer)});
  const client=new Client({name:'sidework-test',version:'1.0.0'});
  try{
    await client.connect(transport);
    const {tools}=await client.listTools();assert.equal(tools.length,6);assert.ok(tools.every(tool=>tool.annotations.readOnlyHint));
    const profile=await client.callTool({name:'get_profile',arguments:{}});assert.equal(profile.structuredContent.handle,'@mager');
    const history=await client.callTool({name:'list_contributions',arguments:{status:'draft'}});assert.equal(history.structuredContent.contributions[0].status,'draft');
    const repos=await client.callTool({name:'list_github_repositories',arguments:{handle:'@mager'}});assert.equal(repos.structuredContent.repositories.length,1);assert.equal(repos.structuredContent.nextPage,null);
    const draft=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}});assert.equal(draft.structuredContent.saved,false);assert.equal(draft.structuredContent.published,false);assert.ok(draft.structuredContent.reviewUrl.startsWith(origin+'/workbench/#review='));
    const described={...project,category:'developer-tools',softwareType:'cli',audience:'Shell users',features:['Preview colors']};
    const metadataDraft=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[described]}});
    assert.deepEqual(metadataDraft.structuredContent.draft.projects[0].features,['Preview colors']);
    assert.equal(metadataDraft.structuredContent.draft.projects[0].category,'developer-tools');
    const invalidMetadata=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[{...described,category:'Rust'}]}});
    assert.equal(invalidMetadata.isError,true);
    const filtered=await client.callTool({name:'list_projects',arguments:{category:'games'}});
    assert.equal(filtered.structuredContent.projects.length,0);
    const malicious=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[{...project,url:'javascript:alert(1)'}]}});assert.equal(malicious.isError,true);
    const resources=await client.listResources();assert.equal(resources.resources[0].uri,'sidework://profiles/mager');
    const resource=await client.readResource({uri:'sidework://profiles/mager'});assert.equal(JSON.parse(resource.contents[0].text).handle,'@mager');
    const prompt=await client.getPrompt({name:'setup_profile',arguments:{handle:'@mager'}});assert.match(prompt.messages[0].content.text,/review link/);
  }finally{await client.close();}
});

test('review links round trip, enforce limits, and reject unsafe or foreign drafts',async()=>{
  const prepared=prepareDraft([{...project,whyBuilt:'A real need.'}],origin);
  const decoded=await decodeReviewLink(new URL(prepared.reviewUrl).hash.slice(8));
  assert.equal(decoded.projects[0].whyBuilt,'A real need.');assert.equal(decoded.handle,'@mager');
  await assert.rejects(decodeReviewLink(gzipSync('x'.repeat(70000)).toString('base64url')),/too large/);
  await assert.rejects(decodeReviewLink('invalid!'),/invalid/);
  assert.throws(()=>parseProfileDraft({...decoded,handle:'@someone-else'}),/only supports/);
  assert.throws(()=>parseProfileDraft({...decoded,projects:[{...project,image:'http://insecure.example/a.jpg'}]}),/HTTPS/);
  assert.throws(()=>parseProfileDraft({...decoded,projects:[project,project]}),/only once/);
});

test('review merges are atomic and preserve unrelated stories and the weekly plan',()=>{
  const state={projects:[{...project,whyBuilt:'Original'},{...project,id:'other',name:'Other',source:'https://github.com/mager/other',url:'https://other.example'}],plan:{vitest:'started'},weekStartedAt:'2026-11-04',showcase:['other','one']};
  const input=prepareDraft([{...project,id:'generated-id',whyBuilt:'Revised'}],origin).draft;
  const merged=mergeProfileDraft(state,input,[project]);
  assert.equal(merged.projects.find(item=>item.id==='one').whyBuilt,'Revised');assert.deepEqual(merged.showcase,['one']);assert.equal(merged.projects.length,2);assert.equal(merged.plan.vitest,'started');assert.equal(state.projects[0].whyBuilt,'Original');
  assert.throws(()=>mergeProfileDraft(state,{...input,projects:[{...project,source:'javascript:bad'}]},[project]));assert.equal(state.projects.length,2);
});
