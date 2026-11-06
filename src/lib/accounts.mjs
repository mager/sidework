import { accountDatabase } from './firestore.mjs';
export function accountStore(config, database = accountDatabase(config)) {
  const document = id => {
    if (!/^[1-9]\d*$/.test(String(id))) throw new Error('Invalid account');
    return database.collection('sidework_accounts').doc(String(id));
  };
  return {
    async find(githubId) {
      const snapshot = await document(githubId).get();
      return snapshot.exists ? { ...snapshot.data(), github_id: String(githubId) } : null;
    },
    async save(identity, updates) {
      const ref = document(identity.githubId);
      return database.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref);
        const now = new Date().toISOString();
        const currentIdentity = { github_id: String(identity.githubId), login: identity.login, email: identity.email, last_login_at: now };
        if (snapshot.exists) {
          // Repeat sign-in must preserve access decisions and saved consent.
          transaction.update(ref, currentIdentity);
          return { ...snapshot.data(), ...currentIdentity };
        }
        const account = { ...currentIdentity, status: config.ownerId === String(identity.githubId) ? 'approved' : 'waiting', email_updates: updates === true, created_at: now, updates_changed_at: now };
        transaction.create(ref, account);
        return account;
      });
    },
    async setUpdates(githubId, updates) {
      await document(githubId).update({ email_updates: updates === true, updates_changed_at: new Date().toISOString() });
    },
  };
}
