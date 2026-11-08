import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { validSession } from './invite.mjs';
import { draftIdentity } from '../scripts/draft-identity.mjs';

export const AGENT_SECONDS = 60 * 60 * 24;
export const AGENT_SCOPES = ['catalog:read', 'github:public', 'draft:prepare'];
export const agentAudience = origin => new URL('/api/mcp', origin).href;
const sign = (body, config) => createHmac('sha256', config.secret).update(`sidework-agent:${body}`).digest('base64url');

export function issueAgentToken(session, config, origin, now = Date.now()) {
  if (!validSession(session, config, now)) throw new Error('An active invitation is required.');
  const [sessionExpiry, invitation] = session.split('.');
  const expires = Math.min(Number(sessionExpiry), Math.floor(now / 1000) + AGENT_SECONDS);
  const claims = { v: 1, aud: agentAudience(origin), exp: expires, invitation, scopes: AGENT_SCOPES, jti: randomUUID() };
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return { token: `sw_agent.${body}.${sign(body, config)}`, expiresAt: new Date(expires * 1000).toISOString(), scopes: AGENT_SCOPES };
}

export function verifyAgentToken(value, config, origin, now = Date.now()) {
  if (config.secret.length < 32 || typeof value !== 'string' || value.length > 1500) return null;
  const [prefix, body, signature, extra] = value.split('.');
  if (prefix !== 'sw_agent' || !body || !signature || extra) return null;
  const expected = Buffer.from(sign(body, config)), actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const remaining = claims.exp - Math.floor(now / 1000);
    if (claims.aud !== agentAudience(origin) || !Number.isInteger(claims.exp) || remaining <= 0 || remaining > AGENT_SECONDS) return null;
    if (claims.v === 1) { if (!config.ready || !config.hashes.includes(claims.invitation)) return null; }
    else if (claims.v === 2) { if (typeof claims.sub !== 'string' || !/^\d+$/.test(claims.sub)) return null; }
    else return null;
    if (JSON.stringify(claims.scopes) !== JSON.stringify(AGENT_SCOPES)) return null;
    return claims;
  } catch { return null; }
}

export function issueAccountAgentToken(session, account, config, origin, now = Date.now()) {
  const current = Math.floor(now / 1000);
  if (!session || account?.status !== 'approved' || session.sub !== account.github_id || session.exp <= current || config.secret.length < 32) throw new Error('Approved account required');
  const exp = Math.min(session.exp, current + AGENT_SECONDS);
  const claims = {v:2, sub:account.github_id, aud:agentAudience(origin), exp, scopes:AGENT_SCOPES, jti:randomUUID()};
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return { token:`sw_agent.${body}.${sign(body, config)}`, expiresAt:new Date(exp * 1000).toISOString(), scopes:AGENT_SCOPES };
}

export async function resolveAgentRequest(request, config) {
  const deny = (status, error) => ({ denied: { status, error } });
  const origin = new URL(request.url).origin;
  const sentOrigin = request.headers.get('origin');
  if (sentOrigin && sentOrigin !== origin) return deny(403, 'This origin is not allowed.');
  const header = request.headers.get('authorization') || '';
  const claims = header.startsWith('Bearer ') && verifyAgentToken(header.slice(7), config, origin);
  if (!claims) return deny(401, 'Create a new agent token in Sidework → Agents. Tokens last up to 24 hours.');
  if (claims.v === 2) {
    try {
      const account = await config.findAccount?.(claims.sub);
      if (account?.status !== 'approved' || account.github_id !== claims.sub) return deny(401, 'Preview access is required.');
      if (typeof account.login !== 'string') return deny(503, 'Account identity is temporarily unavailable.');
      return { identity: draftIdentity({ githubId: account.github_id, handle: `@${account.login}` }) };
    } catch { return deny(503, 'Account access is temporarily unavailable.'); }
  }
  return { identity: null };
}

export async function authorizeAgentRequest(request, config) {
  return (await resolveAgentRequest(request, config)).denied || null;
}
