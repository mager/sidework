import { cleanProject, safeUrl, mergeProjects, readState } from './sidework-state.mjs';
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
export async function fetchRepositories(handle, { fetcher = fetch, signal, onProgress = () => {} } = {}) {
  const user = githubHandle(handle);
  const repos = new Map();
  for (let page = 1; ; page++) {
    const response = await fetcher(`https://api.github.com/users/${encodeURIComponent(user)}/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=${page}`, { signal, headers:{Accept:'application/vnd.github+json'} });
    if (!response.ok) throw new Error(response.status === 404 ? 'That GitHub handle was not found. Check the spelling.' : [403,429].includes(response.status) ? 'GitHub’s public request limit was reached. Wait a while, then try again.' : 'GitHub could not load your repositories. Try again.');
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('GitHub returned an unexpected response. Try again.');
    for (const item of items) {
      const project = repositoryProject(item);
      if (project) repos.set(item.id, { project, fullName:item.full_name, fork:!!item.fork, archived:!!item.archived });
    }
    onProgress(repos.size);
    if (items.length < 100) break;
  }
  return [...repos.values()];
}
export const projectKey = project => (project.source || project.url).replace(/\/$/,'').toLowerCase();
export function importSelection(raw, selected, seed, opportunityIds) {
  const state = readState(raw, opportunityIds);
  const existing = new Set([...seed,...state.projects].map(projectKey));
  const additions = selected.map(cleanProject).filter(project => project && !existing.has(projectKey(project)));
  const projects = mergeProjects(state.projects, additions);
  if (projects.length > 5000) throw new Error('This browser can hold up to 5,000 project drafts. Select fewer repositories.');
  return { value:{ version:1, ...state, projects }, count:projects.length - state.projects.length };
}
