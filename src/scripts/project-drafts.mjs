import { cleanProject, mergeProjects } from './sidework-state.mjs';
import { validateMetadata } from './project-metadata.mjs';
export const MAX_FEATURED = 6;
export const STAGES = { exploring:'Exploring', building:'Building', shipped:'Shipped', paused:'Paused' };
export function showcaseProjects(state, projects, defaults) {
  const order = state.showcase ?? defaults;
  return order.map(id => projects.find(project => project.id === id)).filter(Boolean).slice(0, MAX_FEATURED);
}
export function saveProjectDraft(state, values, seed = []) {
  validateMetadata(values);
  const project = cleanProject({ ...values, local:true });
  if (!project || !project.id) throw new Error('Add a project name and a valid project URL.');
  const key = value => (value.source || value.url).replace(/\/$/,'').toLowerCase();
  if (mergeProjects(seed,state.projects).some(item => item.id !== project.id && key(item) === key(project))) throw new Error('This project is already in your workbench. Edit the existing project instead.');
  if (state.projects.length >= 5000 && !state.projects.some(item => item.id === project.id)) throw new Error('This browser holds up to 5,000 drafts. Remove a draft before adding another.');
  const projects = [...state.projects];
  const index = projects.findIndex(item => item.id === project.id);
  if (index < 0) projects.unshift(project); else projects[index] = project;
  return {...state,projects};
}
export function toggleFeatured(state, projectId, projects, defaults) {
  const order = showcaseProjects(state,projects,defaults).map(project => project.id);
  if (order.includes(projectId)) return {...state,showcase:order.filter(id => id !== projectId)};
  if (!projects.some(project => project.id === projectId)) throw new Error('Save this project before adding it to your profile draft.');
  if (order.length >= MAX_FEATURED) throw new Error('Choose up to six projects. Remove one from your profile draft first.');
  return {...state,showcase:[...order,projectId]};
}
export function moveFeatured(state, projectId, direction, projects, defaults) {
  const order = showcaseProjects(state,projects,defaults).map(project => project.id);
  const index = order.indexOf(projectId), next = index + direction;
  if (![1,-1].includes(direction) || index < 0 || next < 0 || next >= order.length) return state;
  [order[index],order[next]]=[order[next],order[index]];
  return {...state,showcase:order};
}
export function exportShowcase(state, projects, defaults) {
  return { format:'sidework-profile-draft', version:1, visibility:'private-draft', handle:'@mager', projects:showcaseProjects(state,projects,defaults).map(cleanProject) };
}
