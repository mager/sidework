export const STORAGE_KEY = 'sidework-workbench-v1';
export const PLAN_STATES = ['planned', 'started', 'submitted'];
export function safeUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
export function cleanProject(value) {
  if (!value || typeof value !== 'object' || !safeUrl(value.url) || typeof value.name !== 'string' || !value.name.trim()) return null;
  const text = (field, max) => typeof value[field] === 'string' ? value[field].slice(0, max).trim() : '';
  return { id: text('id', 100), name: text('name', 60), description: text('description', 280), stack: text('stack', 80), url: safeUrl(value.url), source: safeUrl(value.source), local: value.local === true };
}
export function readState(raw, opportunityIds) {
  const empty = { projects: [], plan: {}, weekStartedAt: null };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return empty;
    const projects = Array.isArray(value.projects) ? value.projects.slice(0, 50).map(cleanProject).filter(Boolean) : [];
    const plan = {};
    for (const id of opportunityIds) {
      if (PLAN_STATES.includes(value.plan?.[id])) plan[id] = value.plan[id];
    }
    const weekStartedAt = typeof value.weekStartedAt === 'string' && Number.isFinite(Date.parse(value.weekStartedAt)) ? value.weekStartedAt : null;
    return { projects, plan, weekStartedAt };
  } catch { return empty; }
}
export function mergeProjects(seed, added) {
  const seen = new Set();
  return [...added, ...seed].filter(project => {
    const key = (project.source || project.url).replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function filterContributions(items, query, status) {
  const term = query.trim().toLowerCase();
  return items.filter(item => (status === 'all' || item.status === status) && `${item.title} ${item.repository} #${item.number}`.toLowerCase().includes(term));
}
export function githubContribution(item, checkedAt) {
  if (!item?.pull_request || typeof item.title !== 'string' || !Number.isInteger(item.number)) return null;
  const url = safeUrl(item.html_url);
  const match = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+$/);
  if (!match) return null;
  return { id: `${match[1].replace('/', '-')}-${item.number}`, repository: match[1], title: item.title.slice(0, 300), number: item.number, url, status: item.pull_request.merged_at ? 'merged' : item.draft ? 'draft' : item.state === 'closed' ? 'closed' : 'open', date: item.created_at, checkedAt };
}
