import { PROJECT_CATEGORIES, projectMatches } from './project-metadata.mjs';
import { safeUrl } from './sidework-state.mjs';

// Alternate authored work, not raw activity. Preserve each collection's order.
export function workFeed(projects, stories, { kind = '', category = '' } = {}) {
  category = Object.hasOwn(PROJECT_CATEGORIES, category) ? category : '';
  kind = ['projects', 'contributions'].includes(kind) ? kind : category ? 'projects' : 'all';
  if (kind !== 'projects') category = '';
  const personal = projects.filter(project => projectMatches(project, '', category)).map(project => ({
    id: project.id, kind: 'project', name: project.name, description: project.tagline,
    href: `/projects/${project.id}/`, image: project.image,
    detail: PROJECT_CATEGORIES[project.category] || project.kind,
  }));
  const upstream = stories.filter(story => {
    const owner = story.repository.split('/')[0].toLowerCase();
    return owner !== story.author.replace(/^@/, '').toLowerCase();
  }).map(story => ({
    id: story.id, kind: 'contribution', name: story.name, description: story.story,
    href: `/contributions/${story.id}/`, detail: story.repository,
    repositoryUrl: /^[a-z\d-]+\/[a-z\d_.-]+$/i.test(story.repository) ? `https://github.com/${story.repository}` : '',
    image: safeUrl(story.ownerAvatarUrl).startsWith('https://avatars.githubusercontent.com/') ? safeUrl(story.ownerAvatarUrl) : '',
  }));
  if (kind === 'projects') return { kind, category, entries: personal };
  if (kind === 'contributions') return { kind, category, entries: upstream };
  const entries = [];
  for (let i = 0; i < Math.max(personal.length, upstream.length); i++) {
    if (personal[i]) entries.push(personal[i]);
    if (upstream[i]) entries.push(upstream[i]);
  }
  return { kind, category, entries };
}
