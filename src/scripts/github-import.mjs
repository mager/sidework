import { cleanProject, safeUrl, mergeProjects, readState } from './sidework-state.mjs';
export const repositorySources = { repositories: 'Repositories', stars: 'Stars', forks: 'Forks' };
export const repositorySource = value => Object.hasOwn(repositorySources, value) ? value : 'repositories';

export function githubHandle(value) {
  const handle = String(value || '').trim().replace(/^@/, '');
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(handle) || handle.includes('--')) throw new Error('Enter a GitHub handle, such as @mager.');
  return handle;
}
export function repositoryProject(repo) {
  if (repo?.private !== false || !Number.isSafeInteger(repo.id) || typeof repo.full_name !== 'string') return null;
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(repo.html_url || '')) return null;
  return cleanProject({ id:`github-${repo.id}`, name:repo.name, description:repo.description || '', stack:repo.language || '', url:safeUrl(repo.homepage) || repo.html_url, source:repo.html_url, local:true });
}

export function linkedRepositoryNames(names) {
  if (names.some(name => !/^[a-z\d][a-z\d-]{0,38}\/[a-z\d_.-]{1,100}$/i.test(name) || name !== name.trim() || /\/\.{1,2}$/.test(name))) {
    throw new Error('An import link must use GitHub repository names such as owner/repo.');
  }
  const unique = new Map();
  for (const name of names) if (!unique.has(name.toLowerCase())) unique.set(name.toLowerCase(), name);
  if (unique.size > 6) throw new Error('An import link can include up to six repositories.');
  return [...unique.values()];
}

export async function fetchLinkedRepositories(names, { fetcher = fetch, signal } = {}) {
  const selected = linkedRepositoryNames(names);
  const entries = await Promise.all(selected.map(async name => {
    const response = await fetcher(`https://api.github.com/repos/${name}`, { signal, headers: { Accept: 'application/vnd.github+json' } });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error([403, 429].includes(response.status)
      ? 'GitHub’s public request limit was reached. Wait a while, then reload this page.'
      : 'GitHub could not load the linked repositories. Reload this page to retry.');
    const repo = await response.json();
    const project = repositoryProject(repo);
    return project && { project, fullName: repo.full_name, fork: !!repo.fork, archived: !!repo.archived, updatedAt: typeof repo.updated_at === 'string' ? repo.updated_at : '' };
  }));
  const repositories = new Map();
  const unavailable = [];
  entries.forEach((entry, index) => {
    if (entry) repositories.set(entry.project.id, entry);
    else unavailable.push(selected[index]);
  });
  return { repositories: [...repositories.values()], unavailable };
}
export async function fetchRepositories(handle, { source = 'repositories', fetcher = fetch, signal, onProgress = () => {} } = {}) {
  const user = githubHandle(handle);
  const endpoint = source === 'stars' ? 'starred?sort=created&direction=desc' : 'repos?type=owner&sort=updated&direction=desc';
  const repos = new Map();
  for (let page = 1; ; page++) {
    const response = await fetcher(`https://api.github.com/users/${encodeURIComponent(user)}/${endpoint}&per_page=100&page=${page}`, { signal, headers:{Accept:'application/vnd.github+json'} });
    if (!response.ok) throw new Error(response.status === 404 ? 'That GitHub handle was not found. Check the spelling.' : [403,429].includes(response.status) ? 'GitHub’s public request limit was reached. Wait a while, then try again.' : 'GitHub could not load your repositories. Try again.');
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('GitHub returned an unexpected response. Try again.');
    for (const item of items) {
      const project = repositoryProject(item);
      if (project && (source !== 'forks' || item.fork === true)) repos.set(item.id, { project, fullName:item.full_name, fork:!!item.fork, archived:!!item.archived, updatedAt:typeof item.updated_at === 'string' ? item.updated_at : '' });
    }
    onProgress(repos.size);
    if (items.length < 100) break;
  }
  return [...repos.values()];
}
export const projectKey = project => (project.source || project.url).replace(/\/$/,'').toLowerCase();
export function importedProjects(projects) {
  const sources = new Set(projects.map(projectKey));
  const ids = new Set(projects.map(project => project.id).filter(Boolean));
  return project => sources.has(projectKey(project)) || ids.has(project.id);
}
export function importSelection(raw, selected, seed, opportunityIds) {
  const state = readState(raw, opportunityIds);
  const alreadyImported = importedProjects([...(state.includeExamples ? seed : []), ...state.projects]);
  const additions = selected.map(cleanProject).filter(project => project && !alreadyImported(project));
  const projects = mergeProjects(state.projects, additions);
  if (projects.length > 5000) throw new Error('This browser can hold up to 5,000 project drafts. Select fewer repositories.');
  return { value:{ version:1, ...state, projects }, count:projects.length - state.projects.length };
}
