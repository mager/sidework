import { validateAccountDrafts } from './account-draft-data.mjs';
import { cleanProject } from './sidework-state.mjs';
import { withLatestContributionDrafts } from './contribution-drafts.mjs';

const emptyDrafts = () => ({ projects: [], showcase: [], contributionDrafts: [] });
const projectKey = project => (project.source || project.url).replace(/\/$/, '').toLowerCase();

function combineDrafts(saved, incoming) {
  const projects = [...saved.projects], mapped = new Map();
  for (const project of incoming.projects) {
    const index = projects.findIndex(item => item.id === project.id || projectKey(item) === projectKey(project));
    const id = index < 0 ? project.id : projects[index].id;
    mapped.set(project.id, id);
    if (index < 0) projects.push(project);
  }
  const contributionDrafts = [...saved.contributionDrafts];
  for (const story of incoming.contributionDrafts) {
    const index = contributionDrafts.findIndex(item => item.id === story.id);
    if (index < 0) contributionDrafts.push(story);
  }
  const importedOrder = incoming.showcase.map(id => mapped.get(id));
  const order = [...saved.showcase, ...importedOrder];
  return validateAccountDrafts({ projects, contributionDrafts, showcase: [...new Set(order)].filter(Boolean).slice(0, 6) });
}

export function createDraftWorkspace({ identity = null, storage, key, fetcher = fetch, onStatus = () => {} }) {
  let record = null, ready = false, saving = false, pending = null;
  const local = () => {
    const raw = storage.getItem(key);
    if (!raw) return { version: 1, projects: [], showcase: [], contributionDrafts: [], includeExamples: false, plan: {}, weekStartedAt: null };
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) throw new Error('This browser’s workspace cannot be read. Keep a backup before resetting it.');
    return value;
  };
  const localPlan = () => {
    try { const value = local(); return { plan: value.plan || {}, weekStartedAt: value.weekStartedAt || null }; }
    catch { return { plan: {}, weekStartedAt: null }; }
  };
  const request = async (method, body) => {
    let response;
    try {
      response = await fetcher('/api/account/drafts', { method, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-Sidework-Account': identity.githubId }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    } catch { throw new Error(method === 'PUT' ? 'The save could not be confirmed. Your changes are still here. Download the last save attempt before you reload.' : 'Account drafts could not load. Check your connection and try again.'); }
    if (response.redirected) throw new Error('Your session ended. Sign in again before saving.');
    let value;
    try { value = await response.json(); } catch { throw new Error('Account drafts are unavailable. Your changes are still here. Try again.'); }
    if (!response.ok) throw new Error(response.status===409 ? 'Saved drafts changed elsewhere. Download the last save attempt, then reload.' : value.error || 'Account drafts are unavailable. Try again.');
    if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('The saved workspace could not be read. Try again.');
    return { ...value, drafts: validateAccountDrafts(value.drafts) };
  };
  const read = () => {
    if (!ready) throw new Error('Account drafts have not loaded.');
    return identity ? { version: 1, ...localPlan(), ...structuredClone(record.drafts), includeExamples: false } : local();
  };
  return {
    account: !!identity,
    get revision() { return record?.revision ?? null; },
    get busy() { return saving; },
    async load() {
      onStatus({ phase: 'loading', message: identity ? 'Loading account drafts…' : 'Loading browser drafts…' });
      try {
        if (identity) record = await request('GET');
        else local();
        ready = true;
        onStatus({ phase: 'ready', message: identity ? 'Private account drafts' : 'Private drafts · This browser' });
        return read();
      } catch (error) { onStatus({ phase: 'error', message: error.message }); throw error; }
    },
    read,
    async save(next, { projectsOnly = false } = {}) {
      if (!ready) throw new Error('Account drafts have not loaded.');
      if (saving) throw new Error('A save is in progress. Wait for it to finish.');
      if (!identity) {
        const value = projectsOnly ? withLatestContributionDrafts(storage.getItem(key), next) : next;
        try { storage.setItem(key, JSON.stringify({ ...value, version: 1 })); } catch { throw new Error('The draft could not be saved. Your text is still here. Allow browser storage or free some space, then try again.'); }
        return read();
      }
      const drafts = validateAccountDrafts({ projects: next.projects, showcase: next.showcase || [], contributionDrafts: next.contributionDrafts || [] });
      pending = { format: 'sidework-account-drafts', version: 1, githubId: identity.githubId, handle: identity.handle, drafts };
      saving = true;
      onStatus({ phase: 'saving', message: 'Saving account drafts…' });
      try {
        record = await request('PUT', { revision: record.revision, drafts });
        pending = null;
        onStatus({ phase: 'ready', message: 'Saved to your account · Private' });
        return read();
      } catch (error) { onStatus({ phase: 'error', message: error.message }); throw error; }
      finally { saving = false; }
    },
    recovery() { return pending ? structuredClone(pending) : null; },
    backup() {
      if (!identity || !ready) throw new Error('Account drafts have not loaded.');
      return { format: 'sidework-account-drafts', version: 1, githubId: identity.githubId, handle: identity.handle, drafts: structuredClone(record.drafts) };
    },
    reviewBrowserImport(seed = []) {
      const value = local();
      const order = value.showcase || (value.includeExamples !== false ? ['homeport', 'moodsh', 'perch', 'prxps'] : []);
      const projects = [...(value.projects || [])];
      for (const id of order) if (value.includeExamples !== false && !projects.some(project => project.id === id)) {
        const project = seed.find(item => item.id === id);
        if (project) projects.push(cleanProject(project));
      }
      const incoming = validateAccountDrafts({ projects, showcase: order.filter(id=>projects.some(project=>project.id===id)), contributionDrafts: value.contributionDrafts || [] });
      if(!incoming.projects.length && !incoming.contributionDrafts.length)throw new Error('No browser drafts to import.');
      return combineDrafts(record?.drafts || emptyDrafts(), incoming);
    },
    reviewRecovery(value) {
      if (!identity || value?.githubId !== identity.githubId) throw new Error('This backup belongs to another account.');
      if (value.format !== 'sidework-account-drafts' || value.version !== 1) throw new Error('Choose a Sidework account draft backup.');
      return validateAccountDrafts(value.drafts);
    },
  };
}
