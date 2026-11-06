import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running this migration.');
await neon(process.env.DATABASE_URL).query(await readFile(new URL('../migrations/001_accounts.sql', import.meta.url), 'utf8'));
console.log('Account schema is ready.');
