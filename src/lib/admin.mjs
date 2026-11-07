import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const ADMIN_COOKIE = 'sidework-admin';
export const ADMIN_FLOW_COOKIE = 'sidework-admin-flow';
export const ADMIN_SECONDS = 3600;
const hash = value => createHash('sha256').update(value).digest('base64url');
const random = () => randomBytes(32).toString('base64url');
const validToken = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
const origin = value => {
 try { const u=new URL(value); return u.protocol==='https:' || (u.protocol==='http:' && ['localhost','127.0.0.1'].includes(u.hostname)) ? u.origin : ''; } catch { return ''; }
};
export function adminConfiguration(env=process.env) {
 const config={origin:origin(env.SIDEWORK_ADMIN_ORIGIN),mainOrigin:origin(env.SIDEWORK_ORIGIN),secret:env.SIDEWORK_ADMIN_SESSION_SECRET || '',ownerId:env.SIDEWORK_OWNER_GITHUB_ID || ''};
 return {...config,ready:!!(config.origin && config.mainOrigin && config.origin!==config.mainOrigin && config.secret.length>=32 && /^[1-9]\d*$/.test(config.ownerId))};
}
export const isAdminOwner = (account,config) => !!(config.ownerId && account?.github_id===config.ownerId && account.status==='approved');
export const validAdminChallenge = flow => !!(flow && validToken(flow.state) && validToken(flow.challenge));
function seal(claims,purpose,seconds,config,now) {
 if(!config.ready) throw Error('Admin unavailable');
 const body=Buffer.from(JSON.stringify({...claims,aud:config.origin,exp:Math.floor(now/1000)+seconds})).toString('base64url');
 return `${body}.${createHmac('sha256',config.secret).update(`${purpose}:${body}`).digest('base64url')}`;
}
function unseal(value,purpose,seconds,config,now) {
 if(!config.ready || typeof value!=='string' || value.length>2000) return null;
 const [body,mac,extra]=value.split('.'); if(!body||!mac||extra) return null;
 const expected=Buffer.from(createHmac('sha256',config.secret).update(`${purpose}:${body}`).digest('base64url')),actual=Buffer.from(mac);
 if(expected.length!==actual.length || !timingSafeEqual(expected,actual)) return null;
 try { const c=JSON.parse(Buffer.from(body,'base64url').toString());const left=c.exp-Math.floor(now/1000);return c.aud===config.origin && Number.isInteger(c.exp) && left>0 && left<=seconds ? c : null; } catch { return null; }
}
export function beginAdminLogin(config,now=Date.now()) {
 const state=random(),verifier=random(),challenge=hash(verifier);
 return {state,verifier,challenge,cookie:seal({state,verifier},'admin-flow',600,config,now)};
}
export function readAdminFlow(cookie,state,config,now=Date.now()) {
 const flow=unseal(cookie,'admin-flow',600,config,now);
 return flow && validToken(state) && flow.state===state && validToken(flow.verifier) ? flow : null;
}
export function createAdminSession(account,config,now=Date.now()) {
 if(!isAdminOwner(account,config)) throw Error('Owner access required');
 return seal({sub:account.github_id},'admin-session',ADMIN_SECONDS,config,now);
}
export function readAdminSession(cookie,config,now=Date.now()) {
 const session=unseal(cookie,'admin-session',ADMIN_SECONDS,config,now);
 return session?.sub===config.ownerId ? session : null;
}
export async function issueAdminTicket(account,flow,config,db,now=Date.now()) {
 if(!config.origin || !isAdminOwner(account,config) || !validAdminChallenge(flow)) throw Error('Owner access required');
 const code=random();
 await db.collection('sidework_admin_handoffs').doc(hash(code)).create({github_id:account.github_id,challenge:flow.challenge,state:flow.state,audience:config.origin,expires_at:now+60000});
 return code;
}
export async function consumeAdminTicket(code,flow,config,db,now=Date.now()) {
 if(!validToken(code) || !flow || !validToken(flow.verifier) || !validToken(flow.state)) return null;
 const ref=db.collection('sidework_admin_handoffs').doc(hash(code));
 return db.runTransaction(async transaction=>{
  const snapshot=await transaction.get(ref);if(!snapshot.exists) return null;
  const ticket=snapshot.data();
  if(ticket.audience!==config.origin || ticket.github_id!==config.ownerId || ticket.expires_at<=now || ticket.expires_at>now+60000 || ticket.state!==flow.state || ticket.challenge!==hash(flow.verifier)) return null;
  transaction.delete(ref);return ticket.github_id;
 });
}
export async function listAdminAccounts(db,account,config) {
 if(!isAdminOwner(account,config)) throw Error('Owner access required');
 const snapshot=await db.collection('sidework_accounts').orderBy('created_at','desc').limit(1001).select('login','email','status','email_updates','created_at','last_login_at').get();
 return {accounts:snapshot.docs.slice(0,1000).map(doc=>({...doc.data(),github_id:doc.id})),truncated:snapshot.size>1000};
}
export function filterAccounts(accounts,{q='',status='',updates=''}={}) {
 const query=q.trim().replace(/^@/,'').toLowerCase();
 return accounts.filter(a=>(!query || String(a.login).toLowerCase().includes(query) || String(a.email).toLowerCase().includes(query)) && (!status || a.status===status) && (!updates || (a.email_updates===true)===(updates==='yes')));
}
