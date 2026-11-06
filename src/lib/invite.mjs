import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export const COOKIE_NAME = 'sidework-access';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export function requiresInvite(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return !['/invite', '/signup', '/mager', '/auth/github', '/auth/github/callback', '/api/signout'].includes(path);
}
export const hashCode = code => createHash('sha256').update(code).digest('hex');
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export function configuration(env = process.env) {
  const hashes = (env.SIDEWORK_INVITE_HASHES || '').split(',').map(s => s.trim()).filter(s => /^[a-f0-9]{64}$/.test(s));
  const secret = env.SIDEWORK_SESSION_SECRET || '';
  return { hashes, secret, ready: hashes.length > 0 && secret.length >= 32 };
}
export function checkCode(code, config) {
  if (!config.ready || typeof code !== 'string' || code.length > 200) return '';
  const hash = hashCode(code.trim());
  return config.hashes.some(allowed => equal(allowed, hash)) ? hash : '';
}
const sign = (data, secret) => createHmac('sha256', secret).update(data).digest('hex');
export function createSession(hash, config, now = Date.now()) {
  if (!config.ready || !config.hashes.includes(hash)) throw new Error('Invalid invitation');
  const data = `${Math.floor(now / 1000) + SESSION_SECONDS}.${hash}`;
  return `${data}.${sign(data, config.secret)}`;
}
export function validSession(value, config, now = Date.now()) {
  if (!config.ready || typeof value !== 'string' || value.length > 180) return false;
  const [expiry, hash, signature, extra] = value.split('.');
  if (extra || !/^\d+$/.test(expiry || '') || !config.hashes.includes(hash)) return false;
  const remaining = Number(expiry) - Math.floor(now / 1000);
  return remaining > 0 && remaining <= SESSION_SECONDS && equal(signature, sign(`${expiry}.${hash}`, config.secret));
}
export function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value) || value.startsWith('/invite')) return '/';
  try { const url = new URL(value, 'https://sidework.invalid'); return url.origin === 'https://sidework.invalid' ? url.pathname + url.search : '/'; } catch { return '/'; }
}
