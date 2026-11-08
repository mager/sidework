import { accountDatabase } from './firestore.mjs';
import { AccountDraftError, validateAccountDrafts } from '../scripts/account-draft-data.mjs';

export function requireDraftAccount(account) {
  if (!account || typeof account.github_id !== 'string' || !/^[1-9]\d{0,19}$/.test(account.github_id)) throw new AccountDraftError('Sign in again to use account drafts.', 401);
  if (account.status !== 'approved') throw new AccountDraftError('This account is not approved for draft tools.', 403);
  return account.github_id;
}
export function validateDraftWrite(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !['revision', 'drafts'].includes(key)) || !Number.isSafeInteger(value.revision) || value.revision < 0 || value.revision >= Number.MAX_SAFE_INTEGER) throw new AccountDraftError('Send a valid revision and draft data.');
  return { revision: value.revision, drafts: validateAccountDrafts(value.drafts) };
}
function storedRecord(snapshot) {
  if (!snapshot.exists) return { revision: 0, updatedAt: null, drafts: { projects: [], showcase: [], contributionDrafts: [] } };
  try {
    const value = snapshot.data();
    if (!value || !Number.isSafeInteger(value.revision) || value.revision < 1 || typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) throw new Error('Invalid record');
    return { revision: value.revision, updatedAt: value.updatedAt, drafts: validateAccountDrafts(value.drafts) };
  } catch { throw new AccountDraftError('Account drafts cannot be read. Try again later.', 503); }
}
export function accountDraftStore(config, database = accountDatabase(config)) {
  const transact = async (account, write) => {
    const id = requireDraftAccount(account);
    const accountRef = database.collection('sidework_accounts').doc(id);
    const draftRef = database.collection('sidework_drafts').doc(id);
    return database.runTransaction(async transaction => {
      const current = await transaction.get(accountRef);
      const approved = current.exists && current.data();
      if (!approved || approved.status !== 'approved' || approved.github_id !== id) throw new AccountDraftError('This account is not approved for draft tools.', 403);
      const record = storedRecord(await transaction.get(draftRef));
      if (!write) return record;
      if (write.revision !== record.revision) throw new AccountDraftError('Account drafts changed in another tab or browser. Reload before saving.', 409);
      const next = { revision: record.revision + 1, updatedAt: new Date().toISOString(), drafts: write.drafts };
      transaction.set(draftRef, next);
      return next;
    });
  };
  return {
    read: account => transact(account),
    async save(account, payload) {
      requireDraftAccount(account);
      return transact(account, validateDraftWrite(payload));
    },
  };
}
