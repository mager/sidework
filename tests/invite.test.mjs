import test from 'node:test';
import assert from 'node:assert/strict';
import { hashCode, configuration, checkCode, createSession, validSession, safeNext, SESSION_SECONDS, requiresInvite } from '../src/lib/invite.mjs';
const config = configuration({SIDEWORK_INVITE_HASHES:hashCode('a-test-invitation'),SIDEWORK_SESSION_SECRET:'x'.repeat(64)});
const now = 1800000000000;
test('only the invitation and exact mager profile routes are public',()=>{
  for (const path of ['/invite', '/invite/', '/mager', '/mager/']) assert.equal(requiresInvite(path), false, path);
  for (const path of ['/', '/workbench/', '/onboarding/', '/api/signout', '/mager/settings', '/mager-other/', '/another-person/']) assert.equal(requiresInvite(path), true, path);
});
test('invite access fails closed without full configuration',()=>{
  for(const env of [{},{SIDEWORK_INVITE_HASHES:config.hashes[0]},{SIDEWORK_SESSION_SECRET:config.secret}]) {
    assert.equal(checkCode('a-test-invitation',configuration(env)),'');
    assert.equal(validSession('anything',configuration(env)),false);
  }
});
test('code grants signed expiring access; tampering and revocation fail',()=>{
  assert.equal(checkCode('wrong',config),'');
  const hash=checkCode(' a-test-invitation ',config), session=createSession(hash,config,now);
  assert.equal(validSession(session,config,now),true);
  assert.equal(validSession(session,config,now+SESSION_SECONDS*1000),false);
  assert.equal(validSession(session+'x',config,now),false);
  assert.equal(validSession(session.slice(0, -64)+'é'.repeat(64),config,now),false);
  assert.equal(validSession(session.replace(/^\d+/,String(now/1000+SESSION_SECONDS+1)),config,now),false);
  assert.equal(validSession(session,{...config,hashes:[]},now),false);
  assert.equal(validSession(session,{...config,secret:'y'.repeat(64)},now),false);
});
test('return destinations cannot redirect off site or back into invite loop',()=>{
  for(const path of ['https://evil.example','//evil.example','/\\evil.example','/invite/','/\r\nLocation: bad',null]) assert.equal(safeNext(path),'/');
  assert.equal(safeNext('/onboarding/?from=studio'),'/onboarding/?from=studio');
});
