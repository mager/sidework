import { randomBytes } from 'node:crypto';
import { writeFileSync, existsSync } from 'node:fs';
import { hashCode } from '../src/lib/invite.mjs';
if (existsSync('.env') || existsSync('.sidework-invite')) throw new Error('Invite files already exist. Do not overwrite active access keys. See README for rotation.');
const code = `sw-${randomBytes(24).toString('base64url')}`;
writeFileSync('.env', `SIDEWORK_INVITE_HASHES=${hashCode(code)}\nSIDEWORK_SESSION_SECRET=${randomBytes(48).toString('hex')}\n`, {mode:0o600});
writeFileSync('.sidework-invite', `${code}\n`, {mode:0o600});
console.log('Created .env and .sidework-invite with owner-only file permissions. Keep both private.');
