// Version 1 backups belong to the original public example, not a reusable login.
const LEGACY_GITHUB_ID = '17733';
export function draftIdentity(value = null) {
  if (value === null) return { handle: '@mager' };
  if (typeof value?.githubId !== 'string' || !/^[1-9]\d*$/.test(value.githubId) || !/^@[a-z\d][a-z\d-]{0,38}$/i.test(value.handle || '')) throw new Error('Your account identity is unavailable. Sign in again.');
  return { githubId: value.githubId, handle: value.handle };
}

export function draftOwnerFields(identity = null) {
  const owner = draftIdentity(identity);
  return { version: owner.githubId ? 2 : 1, ...owner };
}

export function reviewDraftOwner(draft, identity = null) {
  const owner = draftIdentity(identity);
  if (draft.version === 2) {
    const author = draftIdentity({ githubId: draft.githubId, handle: draft.handle });
    if (!owner.githubId || author.githubId !== owner.githubId) throw new Error('This draft belongs to another account. Sign in with its account to review it.');
  } else if (draft.version === 1) {
    if (!['@mager', 'mager'].includes(draft.handle) || (owner.githubId && owner.githubId !== LEGACY_GITHUB_ID)) throw new Error('This legacy draft only supports the original @mager account.');
  } else throw new Error('Choose a Sidework profile draft, version 1 or 2.');
  return draftOwnerFields(identity);
}

export function browserDraftIdentity(doc = document) {
  const account = doc.querySelector('meta[name="sidework-account"]');
  return account ? draftIdentity({ githubId: account.content, handle: doc.querySelector('meta[name="sidework-handle"]')?.content }) : null;
}
