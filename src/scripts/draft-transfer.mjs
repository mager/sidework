import { cleanProject } from './sidework-state.mjs';
import { saveProjectDraft } from './project-drafts.mjs';

export const MAX_DRAFT_BYTES = 65536;
export function parseProfileDraft(value) {
  if (!value || value.format !== 'sidework-profile-draft' || value.version !== 1 || value.visibility !== 'private-draft') throw new Error('Choose a Sidework profile draft, version 1.');
  if (value.handle !== '@mager' && value.handle !== 'mager') throw new Error('This prototype only supports @mager. Account ownership is not connected yet.');
  if (!Array.isArray(value.projects) || value.projects.length < 1 || value.projects.length > 6) throw new Error('A profile draft must contain one to six projects.');
  const ids = new Set(), sources = new Set();
  const projects = value.projects.map(item => {
    const project = cleanProject(item);
    if (!project || !project.id || !project.description) throw new Error('Each project needs an ID, name, description, and valid project URL.');
    if ((item.source && !project.source) || (item.image && !project.image)) throw new Error('Use HTTP(S) source links and HTTPS screenshots without embedded credentials.');
    const source = (project.source || project.url).replace(/\/$/, '').toLowerCase();
    if (ids.has(project.id) || sources.has(source)) throw new Error('Each project must appear only once in the draft.');
    ids.add(project.id); sources.add(source);
    return { ...project, local: true };
  });
  return { format: 'sidework-profile-draft', version: 1, visibility: 'private-draft', handle: '@mager', projects };
}

export function mergeProfileDraft(state, draft, seed) {
  const checked = parseProfileDraft(draft);
  let next = state;
  const order = [];
  for (const project of checked.projects) {
    const key = value => (value.source || value.url).replace(/\/$/, '').toLowerCase();
    const existing = [...next.projects, ...seed].find(item => item.id === project.id || key(item) === key(project));
    const id = existing?.id || project.id;
    next = saveProjectDraft(next, { ...project, id }, seed);
    if (order.includes(id)) throw new Error('Two draft entries match the same existing project.');
    order.push(id);
  }
  return { ...next, showcase: order };
}

export async function decodeReviewLink(encoded) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length > 16000) throw new Error('This review link is invalid or too long. Use the draft file instead.');
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks = []; let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.length;
      if (total > MAX_DRAFT_BYTES) throw new Error('This draft is too large. Use a file smaller than 64 KB.');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const joined = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.length; }
  return parseProfileDraft(JSON.parse(new TextDecoder().decode(joined)));
}
