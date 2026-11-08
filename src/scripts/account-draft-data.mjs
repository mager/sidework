import { cleanProject, safeUrl } from './sidework-state.mjs';
import { cleanContributionDraft } from './contribution-drafts.mjs';
import { validateMetadata } from './project-metadata.mjs';

export const MAX_ACCOUNT_DRAFT_BYTES = 700000;
export class AccountDraftError extends Error {
  constructor(message, status = 400) { super(message); this.name = 'AccountDraftError'; this.status = status; }
}
const invalid = message => { throw new AccountDraftError(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function fields(value, allowed, label) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) invalid(`Invalid ${label} fields.`);
}
function textFields(value, limits, required = []) {
  for (const [key, max] of Object.entries(limits)) {
    if (value[key] === undefined && !required.includes(key)) continue;
    if (typeof value[key] !== 'string' || value[key].length > max || (required.includes(key) && !value[key].trim())) invalid(`Invalid ${key}. Keep it within ${max} characters.`);
  }
}
function checkBytes(value) {
  let serialized;
  try { serialized = JSON.stringify(value); } catch { invalid('Invalid draft data.'); }
  if (new TextEncoder().encode(serialized).byteLength > MAX_ACCOUNT_DRAFT_BYTES) throw new AccountDraftError('Account drafts exceed 700 KB. Remove content before saving.', 413);
}
const projectText = { id: 100, name: 60, description: 280, stack: 80, tagline: 120, whyBuilt: 1200, learned: 1200, imageAlt: 180, audience: 180 };
const projectFields = [...Object.keys(projectText), 'url', 'source', 'image', 'category', 'softwareType', 'features', 'stage', 'local'];
function validateProject(value) {
  fields(value, projectFields, 'project');
  textFields(value, projectText, ['id', 'name']);
  for (const key of ['url', 'source', 'image']) {
    if (key !== 'url' && (value[key] === undefined || value[key] === '')) continue;
    const url = safeUrl(value[key]);
    if (!url || url.length > 2048 || (key === 'image' && !url.startsWith('https://'))) invalid(`Use a valid ${key} URL of up to 2048 characters without credentials.`);
  }
  if (value.stage !== undefined && !['', 'exploring', 'building', 'shipped', 'paused'].includes(value.stage)) invalid('Invalid project stage.');
  if (value.local !== undefined && typeof value.local !== 'boolean') invalid('Invalid project local flag.');
  for (const key of ['category', 'softwareType']) {
    if (value[key] !== undefined && typeof value[key] !== 'string') invalid(`Invalid project ${key}.`);
  }
  try { validateMetadata(value); } catch (error) { invalid(error.message); }
  if (value.features && new Set(value.features.map(item => item.trim())).size !== value.features.length) invalid('Each project feature must appear once.');
  const project = cleanProject(value);
  if (!project) invalid('Add a project name and a valid project URL.');
  return project;
}
const contributionText = { id: 100, name: 100, handle: 40, repository: 200, story: 2000, evidence: 2048 };
function validateContribution(value) {
  fields(value, Object.keys(contributionText), 'contribution draft');
  textFields(value, contributionText, Object.keys(contributionText));
  const draft = cleanContributionDraft(value);
  if (!draft || draft.evidence.length > 2048) invalid('Add a valid handle, repository, story, and GitHub evidence link of up to 2048 characters from that repository.');
  return draft;
}
function unique(values, label) {
  if (new Set(values).size !== values.length) invalid(`Each ${label} must appear once.`);
}
export function validateAccountDrafts(value) {
  fields(value, ['projects', 'showcase', 'contributionDrafts'], 'account draft');
  for (const [key, max] of [['projects', 5000], ['showcase', 6], ['contributionDrafts', 20]]) {
    if (!Array.isArray(value[key]) || value[key].length > max) invalid(`Provide up to ${max} ${key}.`);
  }
  checkBytes(value);
  const projects = value.projects.map(validateProject);
  unique(projects.map(project => project.id), 'project ID');
  unique(projects.map(project => (project.source || project.url).replace(/\/$/, '').toLowerCase()), 'project source');
  const ids = new Set(projects.map(project => project.id));
  const showcase = value.showcase.map(id => {
    if (typeof id !== 'string' || !id || id.length > 100 || !ids.has(id)) invalid('Featured projects must refer to saved project IDs.');
    return id;
  });
  unique(showcase, 'featured project');
  const contributionDrafts = value.contributionDrafts.map(validateContribution);
  unique(contributionDrafts.map(draft => draft.id), 'contribution draft');
  const result = { projects, showcase, contributionDrafts };
  checkBytes(result);
  return result;
}
