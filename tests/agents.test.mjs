import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { hashCode, createSession, validSession } from '../src/lib/invite.mjs';
import { issueAgentToken, issueAccountAgentToken, verifyAgentToken, AGENT_SECONDS } from '../src/lib/agent-auth.mjs';
import { handleAgentRequest } from '../src/lib/agent-http.mjs';
import { createAgentServer, prepareDraft } from '../src/lib/agent-server.mjs';
import { decodeReviewLink, parseProfileDraft, mergeProfileDraft, MAX_DRAFT_BYTES } from '../src/scripts/draft-transfer.mjs';

const origin='https://sidework.example';
const config={ready:true,hashes:[hashCode('test-invitation')],secret:'a-test-secret-with-more-than-thirty-two-characters'};
const project={id:'one',name:'One',description:'A useful tool.',url:'https://one.example',source:'https://github.com/mager/one'};
const session=()=>createSession(config.hashes[0],config);
const token=()=>issueAgentToken(session(),config,origin).token;
const makeServer=()=>createAgentServer({projects:[project],contributions:[{title:'A fix',repository:'test/repo',status:'draft',checkedAt:'2026-11-04'}],opportunities:[{title:'A keyboard fix',skill:'Accessibility',language:'CSS',repository:'test/repo'}],origin,fetcher:async()=>Response.json([{id:10,name:'public',full_name:'mager/public',private:false,html_url:'https://github.com/mager/public'},{id:11,name:'private',full_name:'mager/private',private:true,html_url:'https://github.com/mager/private'}])});

test('project story prompt uses source context and authenticated identity without saving or inferring personal outcomes',async()=>{
  const identity={githubId:'123',handle:'@builder'};
  const account={github_id:'123',login:'builder',status:'approved'};
  const storyConfig={...config,findAccount:async()=>account};
  const issued=issueAccountAgentToken({sub:'123',exp:Math.floor(Date.now()/1000)+3600},account,storyConfig,origin);
  const makeStoryServer=verified=>createAgentServer({projects:[],contributions:[],opportunities:[],origin,identity:verified});
  const transport=new StreamableHTTPClientTransport(new URL(origin+'/api/mcp'),{requestInit:{headers:{Authorization:`Bearer ${issued.token}`}},fetch:async(input,init)=>handleAgentRequest(new Request(input,init),storyConfig,makeStoryServer)});
  const client=new Client({name:'story-test',version:'1.0.0'});
  try{
    await client.connect(transport);
    const prompts=await client.listPrompts();
    assert.ok(prompts.prompts.some(prompt=>prompt.name==='tell_project_story'));
    const prompt=await client.getPrompt({name:'tell_project_story',arguments:{source:'https://github.com/builder/one',context:'Current checkout README and public source. Personal context is still unknown.'}});
    const text=prompt.messages[0].content.text;
    assert.match(text,/https:\/\/github.com\/builder\/one/);
    assert.match(text,/Current checkout README/);
    assert.match(text,/@builder.*123/);
    assert.match(text,/ask[^.]*motivation/i);
    assert.match(text,/learning/i);
    assert.match(text,/untrusted data/);
    assert.match(text,/prepare_profile_draft/);
    assert.match(text,/browser[^.]*save|save[^.]*browser/i);
    assert.match(text,/Publish/);
    await assert.rejects(client.getPrompt({name:'tell_project_story',arguments:{source:'javascript:alert(1)'}}),/HTTP\(S\)|Invalid arguments/);
    const prepared=await client.callTool({name:'prepare_profile_draft',arguments:{projects:[project]}});
    const value=prepared.structuredContent;
    assert.equal(value.draft.githubId,'123');
    assert.equal(value.draft.handle,'@builder');
    assert.equal(value.saved,false);
    assert.equal(value.published,false);
    assert.equal(JSON.parse(value.file.content).githubId,'123');
    assert.equal(value.file.name,'sidework-profile-draft.json');
    assert.match(value.next,/account/);
    assert.doesNotMatch(value.next,/saving in their browser/);
    assert.equal((await decodeReviewLink(new URL(value.reviewUrl).hash.slice(8),identity)).githubId,'123');
  }finally{await client.close();}
});

test('legacy review instructions identify browser storage and always include a portable file',()=>{
  const value=prepareDraft([project],origin);
  assert.match(value.next,/browser/);
  assert.equal(value.file.mimeType,'application/json');
  assert.deepEqual(JSON.parse(value.file.content),value.draft);
});

test('large valid agent drafts return a file within the browser review byte limit',()=>{
  const projects=Array.from({length:6},(_,index)=>({
    id:`p-${index}`,name:'N'.repeat(60),description:'D'.repeat(280),tagline:'T'.repeat(120),stack:'S'.repeat(80),
    url:`https://example.com/${index}/`+'a'.repeat(1928),source:`https://example.com/source/${index}/`+'b'.repeat(1921),
    image:'https://example.com/image/'+'c'.repeat(1924),imageAlt:'I'.repeat(180),audience:'A'.repeat(180),
    whyBuilt:'é'.repeat(1200),learned:'é'.repeat(20)+'L'.repeat(1180),features:Array(5).fill('F'.repeat(160)),
  }));
  const identity={githubId:'1234',handle:'@builder'};
  const prepared=prepareDraft(projects,origin,identity);
  assert.ok(Buffer.byteLength(JSON.stringify(prepared.draft))<=MAX_DRAFT_BYTES);
  assert.ok(Buffer.byteLength(prepared.file.content)<=MAX_DRAFT_BYTES,'the returned file must fit browser review, including its whitespace');
  assert.deepEqual(parseProfileDraft(JSON.parse(prepared.file.content),identity),prepared.draft);
});

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
