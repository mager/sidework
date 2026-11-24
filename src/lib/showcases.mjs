import { randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import { AccountDraftError } from '../scripts/account-draft-data.mjs';
import { githubHandle } from '../scripts/github-import.mjs';
import { safeUrl } from '../scripts/sidework-state.mjs';
import { validShowcaseSlug } from '../scripts/showcase-path.mjs';
import { requireDraftAccount, storedDraftRecord } from './account-drafts.mjs';
import { accountDatabase } from './firestore.mjs';

export const MAX_FAVORITES = 6;
export const MAX_FAVORITE_NOTE = 160;
export const validFavoriteId = value => typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value);
const validRevision = value => Number.isSafeInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER;

function publicLink(value) {
  const link = safeUrl(value);
  if (!link) return '';
  const host = new URL(link).hostname.toLowerCase().replace(/\.$/, '');
  return host.includes('.') && !isIP(host) && !/\.(localhost|local|internal)$/.test(host) ? link : '';
}

function repoUrl(repository) {
  if (typeof repository !== 'string' || !/^[a-z\d-]{1,39}\/[a-z\d_.-]{1,100}$/i.test(repository) || /\/\.{1,2}$/.test(repository)) return '';
  return `https://github.com/${repository}`;
}

function favoriteFields(value) {
  if (!validFavoriteId(value?.id) || !repoUrl(value.repository) || value.url !== repoUrl(value.repository)
    || typeof value.note !== 'string' || value.note.length > MAX_FAVORITE_NOTE) throw new Error('Invalid favorite repository.');
  return { id: value.id, repository: value.repository, url: value.url, note: value.note.trim() };
}

export async function resolvePublicFavorite(id, fetcher = fetch) {
  if (!validFavoriteId(id)) throw new AccountDraftError('Choose a GitHub repository.');
  let response;
  try {
    response = await fetcher(`https://api.github.com/repositories/${id}`, {
      headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(8000), redirect: 'error',
    });
  } catch { throw new AccountDraftError('GitHub could not verify this repository. Try again.', 503); }
  if (response.status === 404) throw new AccountDraftError('GitHub could not find this public repository.', 404);
  if (!response.ok) throw new AccountDraftError('GitHub could not verify this repository. Try again.', 503);
  let repo;
  try { repo = await response.json(); } catch { throw new AccountDraftError('GitHub returned invalid repository data.', 503); }
  if (repo?.private !== false || String(repo.id) !== id || !repoUrl(repo.full_name) || repo.html_url !== repoUrl(repo.full_name)) throw new AccountDraftError('Choose a public GitHub repository.');
  return { id, repository: repo.full_name, url: repo.html_url, note: '' };
}

export function buildShowcasePreview(workspace, projectId) {
  const project = workspace.projects.find(item => item.id === projectId);
  if (!project) return null;
  return {
    handle: workspace.handle,
    project: {
      name: project.name, tagline: project.tagline, description: project.description, stack: project.stack,
      url: publicLink(project.url), source: publicLink(project.source), image: publicLink(project.image), imageAlt: project.imageAlt,
    },
    favorites: workspace.favorites.map(({ repository, url, note }) => ({ repository, url, note })),
  };
}

function favoriteRecord(snapshot) {
  if (!snapshot.exists) return { revision: 0, favorites: [] };
  const { revision, favorites } = snapshot.data();
  if (!validRevision(revision) || revision < 1 || !Array.isArray(favorites) || favorites.length > MAX_FAVORITES) throw new Error('Invalid favorite record.');
  return { revision, favorites: favorites.map(favoriteFields) };
}

function publicationRecord(snapshot) {
  if (!snapshot.exists) return { revision: 0, slug: null, projectId: null, listed: false, publishedAt: null, content: null };
  const { revision, slug, projectId, listed, publishedAt, content } = snapshot.data();
  if (!validRevision(revision) || revision < 1 || !validShowcaseSlug(slug) || typeof listed !== 'boolean' || (listed && !content)
    || (content && (typeof projectId !== 'string' || typeof publishedAt !== 'string'))) throw new Error('Invalid showcase record.');
  return { revision, slug, projectId, listed, publishedAt, content };
}

function assertRevision(expected, actual) {
  if (!validRevision(expected) || expected !== actual) throw new AccountDraftError('This showcase changed. Review the latest version.', 409);
}

export function showcaseStore(config, database = accountDatabase(config)) {
  const accounts = database.collection('sidework_accounts');
  const drafts = database.collection('sidework_drafts');
  const favorites = database.collection('sidework_favorites');
  const publications = database.collection('sidework_showcases');

  async function forAccount(account, run) {
    const id = requireDraftAccount(account);
    return database.runTransaction(async transaction => {
      const record = await transaction.get(accounts.doc(id));
      const current = record.exists ? record.data() : null;
      if (current?.github_id !== id || current.status !== 'approved') throw new AccountDraftError('This account is not approved for showcase tools.', 403);
      return run(transaction, id, current);
    });
  }

  async function workspace(transaction, id, current) {
    const [draftSnapshot, favoriteSnapshot, publicationSnapshot] = await Promise.all([
      transaction.get(drafts.doc(id)), transaction.get(favorites.doc(id)), transaction.get(publications.doc(id)),
    ]);
    const draft = storedDraftRecord(draftSnapshot);
    const saved = favoriteRecord(favoriteSnapshot);
    const { content, ...publication } = publicationRecord(publicationSnapshot);
    return { handle: `@${githubHandle(current.login)}`, projects: draft.drafts.projects, draftRevision: draft.revision,
      favorites: saved.favorites, favoritesRevision: saved.revision, publication, publicationContent: content };
  }

  async function visible(snapshot) {
    const record = publicationRecord(snapshot);
    if (!record.content || !validFavoriteId(snapshot.id)) return null;
    const author = await accounts.doc(snapshot.id).get();
    const current = author.exists ? author.data() : null;
    return current?.status === 'approved' && current.github_id === snapshot.id ? record : null;
  }

  return {
    read: account => forAccount(account, workspace),
    readFavorites: account => forAccount(account, async (transaction, id) => favoriteRecord(await transaction.get(favorites.doc(id)))),
    changeFavorite(account, change) {
      return forAccount(account, async (transaction, id) => {
        const ref = favorites.doc(id);
        const current = favoriteRecord(await transaction.get(ref));
        assertRevision(change.revision, current.revision);
        const items = current.favorites;
        if (change.action === 'add') {
          const favorite = favoriteFields(change.favorite);
          if (items.some(item => item.id === favorite.id)) return current;
          if (items.length >= MAX_FAVORITES) throw new AccountDraftError(`Choose up to ${MAX_FAVORITES} favorite repos.`);
          items.push(favorite);
        } else {
          const index = items.findIndex(item => item.id === change.favoriteId);
          if (index < 0) throw new AccountDraftError('Choose a saved favorite repository.');
          if (change.action === 'remove') items.splice(index, 1);
          else if (change.action === 'note' && typeof change.note === 'string' && change.note.length <= MAX_FAVORITE_NOTE) items[index].note = change.note.trim();
          else throw new AccountDraftError(`Keep the note within ${MAX_FAVORITE_NOTE} characters.`);
        }
        const next = { revision: current.revision + 1, favorites: items };
        transaction.set(ref, next);
        return next;
      });
    },
    publish(account, action) {
      return forAccount(account, async (transaction, id, current) => {
        const model = await workspace(transaction, id, current);
        assertRevision(action.revision, model.publication.revision);
        assertRevision(action.draftRevision, model.draftRevision);
        assertRevision(action.favoritesRevision, model.favoritesRevision);
        if (action.handle !== model.handle) throw new AccountDraftError('Your handle changed. Review the showcase again.', 409);
        const content = buildShowcasePreview(model, action.projectId);
        if (!content) throw new AccountDraftError('Choose a saved project to publish.');
        const publication = { revision: model.publication.revision + 1, slug: model.publication.slug || randomBytes(16).toString('hex'),
          projectId: action.projectId, listed: action.listed === true, publishedAt: new Date().toISOString() };
        transaction.set(publications.doc(id), { ...publication, content });
        return publication;
      });
    },
    unpublish(account, action) {
      return forAccount(account, async (transaction, id) => {
        const ref = publications.doc(id);
        const current = publicationRecord(await transaction.get(ref));
        assertRevision(action.revision, current.revision);
        if (current.content) transaction.set(ref, { revision: current.revision + 1, slug: current.slug, projectId: null, listed: false, publishedAt: null, content: null });
      });
    },
    async publicBySlug(slug) {
      if (!validShowcaseSlug(slug)) return null;
      const result = await publications.where('slug', '==', slug).limit(1).get();
      const record = result.docs.length ? await visible(result.docs[0]) : null;
      return record ? { ...record.content, publishedAt: record.publishedAt } : null;
    },
    async explore() {
      const result = await publications.where('listed', '==', true).limit(24).get();
      const records = await Promise.all(result.docs.map(async snapshot => {
        const record = await visible(snapshot);
        return record?.listed ? { githubId: snapshot.id, slug: record.slug, handle: record.content.handle, project: record.content.project } : null;
      }));
      return records.filter(Boolean);
    },
  };
}
