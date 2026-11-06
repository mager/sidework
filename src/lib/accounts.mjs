import { neon } from '@neondatabase/serverless';
export function accountStore(config) {
  if (!config.databaseUrl) throw new Error('Account database unavailable');
  const sql = neon(config.databaseUrl);
  return {
    async find(githubId) {
      const rows = await sql`SELECT github_id::text, login, email, status, email_updates, created_at FROM sidework_accounts WHERE github_id = ${githubId}`;
      return rows[0] || null;
    },
    async save(identity, updates) {
      const status = config.ownerId && identity.githubId === config.ownerId ? 'approved' : 'waiting';
      const rows = await sql`INSERT INTO sidework_accounts (github_id, login, email, status, email_updates, updates_changed_at)
        VALUES (${identity.githubId}, ${identity.login}, ${identity.email}, ${status}, ${updates === true}, NOW())
        ON CONFLICT (github_id) DO UPDATE SET login = EXCLUDED.login, email = EXCLUDED.email, last_login_at = NOW()
        RETURNING github_id::text, login, email, status, email_updates, created_at`;
      return rows[0];
    },
    async setUpdates(githubId, updates) {
      await sql`UPDATE sidework_accounts SET email_updates = ${updates === true}, updates_changed_at = NOW() WHERE github_id = ${githubId}`;
    },
  };
}
