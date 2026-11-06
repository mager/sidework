import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ACCOUNT_COOKIE = 'sidework-account';
export const OAUTH_COOKIE = 'sidework-oauth';
export const ACCOUNT_SECONDS = 60 * 60 * 24 * 7;
export const OAUTH_SECONDS = 600;
export function authConfiguration(env = process.env) {
  let origin = '';
  try {
    const url = new URL(env.SIDEWORK_ORIGIN || '');
    if (url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) origin = url.origin;
  } catch {}
  const config = { origin, clientId: env.GITHUB_CLIENT_ID || '', clientSecret: env.GITHUB_CLIENT_SECRET || '', secret: env.SIDEWORK_SESSION_SECRET || '', projectId: env.GCP_PROJECT_ID || '', projectNumber: env.GCP_PROJECT_NUMBER || '', serviceAccountEmail: env.GCP_SERVICE_ACCOUNT_EMAIL || '', poolId: env.GCP_WORKLOAD_IDENTITY_POOL_ID || '', providerId: env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || '', ownerId: env.SIDEWORK_OWNER_GITHUB_ID || '' };
  return { ...config, ready: !!(origin && config.clientId && config.clientSecret && config.secret.length >= 32 && [config.projectId, config.projectNumber, config.serviceAccountEmail, config.poolId, config.providerId].every(Boolean)) };
}
const signature = (body, secret, purpose) => createHmac('sha256', secret).update(`sidework-${purpose}:${body}`).digest('base64url');
function seal(claims, config, purpose, seconds, now) {
  if (config.secret.length < 32) throw new Error('Session configuration missing');
  const body = Buffer.from(JSON.stringify({ ...claims, aud:config.origin, exp:Math.floor(now / 1000) + seconds })).toString('base64url');
  return `${body}.${signature(body, config.secret, purpose)}`;
}
function unseal(value, config, purpose, seconds, now) {
  if (!config.origin || config.secret.length < 32 || typeof value !== 'string' || value.length > 3000) return null;
  const [body, mac, extra] = value.split('.');
  if (!body || !mac || extra) return null;
  const expected = Buffer.from(signature(body, config.secret, purpose)), actual = Buffer.from(mac);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const remaining = claims.exp - Math.floor(now / 1000);
    return claims.aud === config.origin && Number.isInteger(claims.exp) && remaining > 0 && remaining <= seconds ? claims : null;
  } catch { return null; }
}
export function createAccountSession(githubId, config, now = Date.now()) {
  if (!/^\d+$/.test(String(githubId))) throw new Error('Invalid account');
  return seal({ sub:String(githubId) }, config, 'account', ACCOUNT_SECONDS, now);
}
export function readAccountSession(value, config, now = Date.now()) {
  const claims = unseal(value, config, 'account', ACCOUNT_SECONDS, now);
  return claims && /^\d+$/.test(claims.sub) ? claims : null;
}
export function beginGithubLogin(config, updates = false, now = Date.now()) {
  if (!config.ready) throw new Error('GitHub sign-in unavailable');
  const state = randomBytes(32).toString('base64url'), verifier = randomBytes(32).toString('base64url');
  const cookie = seal({ state, verifier, updates:updates === true }, config, 'oauth', OAUTH_SECONDS, now);
  const url = new URL('https://github.com/login/oauth/authorize');
  url.search = new URLSearchParams({ client_id:config.clientId, redirect_uri:`${config.origin}/auth/github/callback/`, scope:'user:email', state, code_challenge:createHash('sha256').update(verifier).digest('base64url'), code_challenge_method:'S256' }).toString();
  return { url:url.href, cookie };
}
export function readOauthState(cookie, state, config, now = Date.now()) {
  const flow = unseal(cookie, config, 'oauth', OAUTH_SECONDS, now);
  return flow && typeof state === 'string' && state === flow.state ? flow : null;
}
async function githubJson(fetcher, url, options = {}) {
  const response = await fetcher(url, { ...options, signal:AbortSignal.timeout(10000), headers:{ Accept:'application/json', 'User-Agent':'Sidework', ...options.headers } });
  if (!response.ok) throw new Error('GitHub request failed');
  return response.json();
}
export async function githubIdentity(code, verifier, config, fetcher = fetch) {
  const token = await githubJson(fetcher, 'https://github.com/login/oauth/access_token', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({ client_id:config.clientId, client_secret:config.clientSecret, code, code_verifier:verifier, redirect_uri:`${config.origin}/auth/github/callback/` }).toString(),
  });
  if (typeof token.access_token !== 'string' || token.error) throw new Error('GitHub authorization failed');
  const options = {headers:{Authorization:`Bearer ${token.access_token}`}};
  const user = await githubJson(fetcher, 'https://api.github.com/user', options);
  const emails = await githubJson(fetcher, 'https://api.github.com/user/emails', options);
  const email = Array.isArray(emails) && (emails.find(item => item.verified && item.primary) || emails.find(item => item.verified));
  if (!Number.isSafeInteger(user.id) || user.id <= 0 || !/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user.login || '')) throw new Error('Invalid GitHub identity');
  if (!email || typeof email.email !== 'string' || email.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email)) throw new Error('verified-email-required');
  // Provider tokens are used only for this sign-in. Never store or return them.
  return { githubId:String(user.id), login:user.login, email:email.email };
}
export async function readForm(request) {
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) throw new Error('Invalid form');
  const reader = request.body?.getReader();
  const chunks = []; let size = 0;
  if (reader) for (;;) {
    const {done,value} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 2048) { await reader.cancel(); throw new Error('Form too large'); }
    chunks.push(Buffer.from(value));
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}
export function accountAccess(account, legacyAccess = false) {
  return account ? account.status === 'approved' : legacyAccess;
}
