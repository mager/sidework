import { STORAGE_KEY, safeUrl, cleanProject, readState, mergeProjects, filterContributions, githubContribution } from './sidework-state.mjs';

import { MAX_FEATURED, STAGES, showcaseProjects, saveProjectDraft, toggleFeatured, moveFeatured, exportShowcase } from './project-drafts.mjs';
import { projectPreview } from './project-preview';

type Project = { id: string; name: string; description: string; stack: string; url: string; source?: string; local?: boolean; tagline?: string; whyBuilt?: string; learned?: string; image?: string; imageAlt?: string; stage?: string; };
type Contribution = { id: string; title: string; repository: string; number: number; url: string; status: string; date: string; checkedAt: string; };
type Opportunity = { id: string; name: string; title: string; next: string; url: string; skill: string; };
const seed = JSON.parse(document.getElementById('sidework-seed')!.textContent!) as { projects: Project[]; contributions: Contribution[]; opportunities: Opportunity[] };
const root = document.getElementById('sidework')!;
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const make = (tag: string, className = '', text = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
const link = (text: string, url: string, className = '') => {
  const node = make('a', className, text) as HTMLAnchorElement;
  node.href = safeUrl(url) || '#';
  return node;
};
const notify = (text: string, error = false) => {
  const notice = $('#feedback');
  notice.textContent = text;
  notice.hidden = false;
  notice.toggleAttribute('data-error', error);
};
let storageAvailable = true;
let raw: string | null = null;
try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
let state = readState(raw, seed.opportunities.map(item => item.id));
let items = seed.contributions;
let importedProjects: Project[] = [];
let contributionLimit = 12;
const save = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...state })); return true; }
  catch { storageAvailable = false; notify('Browser storage is unavailable. Your changes work for this visit but will not survive a reload.', true); return false; }
};
const defaultShowcase = ['homeport','moodsh','perch','prxps'];
let editorActive = false;
let editingId = '';
let editorBaseline = '';
const allProjects = () => mergeProjects(seed.projects, [...state.projects, ...importedProjects]) as Project[];
const views = ['overview', 'projects', 'showcase', 'editor', 'contributions', 'discover', 'plan', 'connections'];
function showView(id: string, focus = false) {
  let view = views.includes(id) ? id : 'overview';
  if (view === 'editor' && !editorActive) view = 'projects';
  if (view !== 'editor' && editorActive) {
    if (editorDirty() && !window.confirm('Discard the unsaved changes to this project?')) { history.replaceState(null, '', '#editor'); return; }
    editorActive = false;
  }
  root.dataset.view = view;
  for (const panel of document.querySelectorAll<HTMLElement>('.sw-panel')) panel.hidden = panel.id !== view;
  for (const nav of document.querySelectorAll<HTMLElement>('.sw-rail [data-view]')) {
    if (nav.dataset.view === view) nav.setAttribute('aria-current', 'page');
    else nav.removeAttribute('aria-current');
  }
  if (focus) {
    const heading = document.querySelector<HTMLElement>(`#${view} h2`);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    $('#main-content').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
document.addEventListener('click', event => {
  const control = (event.target as Element).closest<HTMLAnchorElement>('a[data-view], #manage-github');
  if (!control) return;
  event.preventDefault();
  const id = control.dataset.view || 'connections';
  if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  showView(id, true);
});
window.addEventListener('hashchange', () => showView(location.hash.slice(1)));
window.addEventListener('popstate', () => showView(location.hash.slice(1)));

function renderProjects() {
  const query = $('#project-search') as HTMLInputElement;
  const all = allProjects();
  const featured = showcaseProjects(state,all,defaultShowcase).map((item: Project) => item.id);
  const filtered = all.filter(project => `${project.name} ${project.description} ${project.stack}`.toLowerCase().includes(query.value.trim().toLowerCase()));
  const list = $('#project-list'); list.replaceChildren();
  $('#project-count').textContent = `${filtered.length} of ${all.length} projects`;
  $('#project-empty').hidden = filtered.length !== 0;
  for (const project of filtered) {
    const row = make('article', 'sw-project-row');
    const monogram = make('span', 'sw-project-monogram', project.name.slice(0, 1));
    monogram.setAttribute('aria-hidden', 'true');
    const copy = make('div'); const heading = make('h3'); heading.append(link(project.name, project.url));
    copy.append(heading, make('p', '', project.description), make('small', '', project.stack || 'Personal project'));
    const actions = make('div', 'sw-row-actions');
    const edit = make('button','sw-button','Edit story') as HTMLButtonElement; edit.type='button'; edit.dataset.editProject=project.id; edit.setAttribute('aria-label',`Edit ${project.name}`);
    const feature = make('button','sw-button sw-feature-toggle',featured.includes(project.id) ? 'Featured' : 'Feature') as HTMLButtonElement; feature.type='button'; feature.dataset.featureProject=project.id; feature.setAttribute('aria-pressed',String(featured.includes(project.id))); feature.setAttribute('aria-label',`${featured.includes(project.id) ? 'Unfeature' : 'Feature'} ${project.name}`);
    actions.append(edit,feature,link('Open project', project.url, 'sw-button'));
    if (project.source && project.source !== project.url) actions.append(link('View source', project.source, 'sw-button'));
    if (project.local) {
      const remove = make('button', 'sw-button', seed.projects.some(item => item.id === project.id) ? 'Discard local changes' : 'Remove local project') as HTMLButtonElement;
      remove.type = 'button'; remove.dataset.removeProject = project.id; actions.append(remove);
      copy.append(make('small', '', 'Local draft · Not on your public profile'));
    }
    row.append(monogram, copy, actions); list.append(row);
  }
  renderShowcase();
}
$('#project-search').addEventListener('input', renderProjects);
$('#project-list').addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-remove-project]');
  if (!button) return;
  state.projects = state.projects.filter((p: Project) => p.id !== button.dataset.removeProject);
  const persisted = save(); renderProjects();
  if (persisted) notify('Local project removed. The public profile is unchanged.');
});
function contributionRow(item: Contribution, compact = false) {
  const row = make('article', 'sw-contribution');
  row.append(make('span', `sw-status sw-status-${item.status}`, item.status));
  const copy = make('div'); const heading = make('h3'); heading.append(link(item.title, item.url));
  copy.append(heading, make('p', '', `${item.repository} #${item.number}`));
  if (!compact) copy.append(make('small', '', `State checked ${item.checkedAt}`));
  const evidence = link('View', item.url, 'sw-evidence'); evidence.setAttribute('aria-label', `View pull request ${item.number}`);
  row.append(copy, evidence); return row;
}
function renderContributions() {
  const query = ($('#contribution-search') as HTMLInputElement).value;
  const status = ($('#contribution-status') as HTMLSelectElement).value;
  const filtered = filterContributions(items, query, status) as Contribution[];
  $('#contribution-list').replaceChildren(...filtered.slice(0, contributionLimit).map(item => contributionRow(item)));
  $('#contribution-empty').hidden = filtered.length !== 0;
  $('#more-contributions').hidden = filtered.length <= contributionLimit;
  $('#recent-list').replaceChildren(...items.slice(0, 4).map(item => contributionRow(item, true)));
}
for (const selector of ['#contribution-search', '#contribution-status']) {
  $(selector).addEventListener(selector.includes('search') ? 'input' : 'change', () => { contributionLimit = 12; renderContributions(); });
}
$('#more-contributions').addEventListener('click', () => { contributionLimit += 12; renderContributions(); });
for (const chip of document.querySelectorAll<HTMLButtonElement>('[data-skill]')) chip.addEventListener('click', () => {
  for (const control of document.querySelectorAll('[data-skill]')) control.setAttribute('aria-pressed', String(control === chip));
  for (const opportunity of document.querySelectorAll<HTMLElement>('[data-opportunity]')) opportunity.hidden = chip.dataset.skill !== 'all' && opportunity.dataset.skillName !== chip.dataset.skill;
});

function renderPlan() {
  const planned = seed.opportunities.filter(item => Object.hasOwn(state.plan, item.id));
  const submitted = planned.filter(item => state.plan[item.id] === 'submitted').length;
  $('#saved-count').textContent = String(planned.length);
  $('#submitted-count').textContent = String(submitted);
  $('#week-hint').textContent = planned.length ? `${planned.length} saved · ${submitted} submitted` : 'Start with one useful fix.';
  $('#plan-empty').hidden = planned.length > 0;
  document.querySelectorAll('.sw-goal-steps i').forEach((step, i) => step.toggleAttribute('data-complete', i < submitted));
  if (state.weekStartedAt) {
    const start = new Date(state.weekStartedAt); const end = new Date(start); end.setDate(end.getDate() + 7);
    const format = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    $('#week-label').textContent = `${format.format(start)} – ${format.format(end)}`;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-save]')) {
    const saved = Object.hasOwn(state.plan, button.dataset.save!);
    button.setAttribute('aria-pressed', String(saved));
    button.querySelector('span')!.textContent = saved ? 'Saved to week' : 'Save to week';
  }
  const list = $('#plan-list'); list.replaceChildren();
  for (const item of planned) {
    const row = make('article', 'sw-plan-row');
    const heading = make('h3'); heading.append(link(`${item.name}: ${item.title}`, item.url));
    row.append(heading, make('p', '', item.next));
    const controls = make('div'); const label = make('label', '', 'Progress');
    const select = document.createElement('select'); select.dataset.progress = item.id; select.setAttribute('aria-label', `${item.name} progress`);
    for (const [value, text] of [['planned', 'Planned'], ['started', 'In progress'], ['submitted', 'Submitted']]) {
      const option = new Option(text, value); option.selected = state.plan[item.id] === value; select.append(option);
    }
    label.append(select);
    const remove = make('button', 'sw-button', 'Remove') as HTMLButtonElement; remove.type = 'button'; remove.dataset.remove = item.id; remove.setAttribute('aria-label', `Remove ${item.name} from plan`);
    controls.append(label, link('Open issue', item.url, 'sw-button'), remove); row.append(controls); list.append(row);
  }
  const slots = $('#week-slots'); slots.replaceChildren();
  for (let i = 0; i < 4; i++) {
    const item = planned[i]; const slot = document.createElement('a');
    slot.href = item ? '#plan' : '#discover'; slot.dataset.view = item ? 'plan' : 'discover';
    if (item) slot.setAttribute('data-filled', '');
    slot.append(make('span', 'sw-slot-number', String(i + 1)), make('span', '', item?.name || 'Choose a project'));
    slots.append(slot);
  }
}
document.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-save], [data-remove]');
  if (!button) return;
  const id = button.dataset.save || button.dataset.remove!;
  if (!seed.opportunities.some(item => item.id === id)) return;
  if (Object.hasOwn(state.plan, id)) delete state.plan[id];
  else { state.plan[id] = 'planned'; state.weekStartedAt ||= new Date().toISOString(); }
  const persisted = save(); renderPlan();
  if (persisted) notify(Object.hasOwn(state.plan, id) ? 'Added to your weekly plan. The issue is not assigned to you.' : 'Removed from your weekly plan.');
});
$('#plan-list').addEventListener('change', event => {
  const select = event.target as HTMLSelectElement;
  if (!select.dataset.progress || !['planned', 'started', 'submitted'].includes(select.value)) return;
  state.plan[select.dataset.progress] = select.value;
  const persisted = save(); renderPlan();
  document.querySelector<HTMLSelectElement>(`[data-progress="${select.dataset.progress}"]`)?.focus();
  if (persisted) notify('Progress saved in this browser. GitHub was not changed.');
});

const form = $('#project-form') as HTMLFormElement;
const draftValues = () => Object.fromEntries(new FormData(form).entries());
function editorDirty() { return editorActive && JSON.stringify(draftValues()) !== editorBaseline; }
function updateEditorPreview() {
  const values = draftValues();
  const preview = projectPreview(values);
  const oldFrame = $('#project-preview').querySelector('.sw-story-image');
  const nextFrame = preview.querySelector('.sw-story-image');
  const oldImage = oldFrame?.querySelector('img'), nextImage = nextFrame?.querySelector('img');
  if (oldImage && nextImage && oldImage.src === nextImage.src) { oldImage.alt=nextImage.alt; nextFrame!.replaceWith(oldFrame!); }
  $('#project-preview').replaceChildren(preview);
  $('#draft-save-note').textContent = editorDirty() ? 'Unsaved changes · Save keeps them in this browser.' : 'Saved only in this browser. Your public profile stays unchanged.';
}
function openEditor(project?: Project) {
  if (editorDirty() && !window.confirm('Discard the unsaved changes to this project?')) return;
  form.reset();
  for (const control of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select')) control.value=String((project as any)?.[control.name] || '');
  editingId = project?.id || `local-${crypto.randomUUID()}`;
  editorActive = true; editorBaseline = JSON.stringify(draftValues());
  $('#editor-title').textContent = project ? `The story behind ${project.name}.` : 'Tell the story.';
  $('#draft-error').hidden=true;
  updateEditorPreview();
  history.pushState(null,'','#editor'); showView('editor',true);
  form.querySelector<HTMLInputElement>('[name=name]')!.focus({preventScroll:true});
}
function persistDraftState(next: typeof state) {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,...next}));state=next;return true; }
  catch { notify('Could not save to this browser. Your last saved draft is unchanged. Allow browser storage or free some space, then try again.',true);return false; }
}
$('#add-project').addEventListener('click',()=>openEditor());
$('#cancel-project').addEventListener('click',()=>{ showView('projects',true); if(!editorActive) history.pushState(null,'','#projects'); });
form.addEventListener('input',event=>{ $('#draft-error').hidden=true; if((event.target as HTMLInputElement).name !== 'image')updateEditorPreview(); });
form.addEventListener('change',updateEditorPreview);
window.addEventListener('beforeunload',event=>{ if(editorDirty()){event.preventDefault();event.returnValue='';} });
form.addEventListener('submit', event => {
  event.preventDefault();
  const values=draftValues();
  const fail=(text:string)=>{ $('#draft-error').textContent=text;$('#draft-error').hidden=false;$('#draft-error').scrollIntoView({block:'nearest'}); };
  if ((values.source && !safeUrl(values.source)) || !safeUrl(values.url)) {fail('Use a complete HTTP or HTTPS link without a username or password.');return;}
  if (values.image && !safeUrl(values.image).startsWith('https://')) {fail('Use a public HTTPS image link for the screenshot.');return;}
  try {
    const next=saveProjectDraft(state,{...values,id:editingId},seed.projects);
    if(!persistDraftState(next)){fail('Your draft could not be saved. Your changes are still here; try again after you allow browser storage or free some space.');return;}
    editorBaseline=JSON.stringify(draftValues()); editorActive=false;
    renderProjects(); history.pushState(null,'','#projects');showView('projects',true);
    notify('Project story saved in this browser. Your public profile is unchanged.');
  }catch(error){fail(error instanceof Error ? error.message : 'Could not save this draft. Try again.');}
});
document.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('[data-edit-project],[data-feature-project],[data-move-project]');
  if(!button)return;
  const id=button.dataset.editProject || button.dataset.featureProject || button.dataset.moveProject!;
  const project=allProjects().find(item=>item.id===id);if(!project)return;
  if(button.dataset.editProject){openEditor(project);return;}
  try {
    let next=state;
    if(button.dataset.featureProject){
      if(!seed.projects.some(item=>item.id===id) && !state.projects.some((item:Project)=>item.id===id)) next=saveProjectDraft(next,project,seed.projects);
      next=toggleFeatured(next,id,allProjects(),defaultShowcase);
    } else next=moveFeatured(next,id,Number(button.dataset.direction),allProjects(),defaultShowcase);
    if(!persistDraftState(next))return;
    const action=button.dataset.featureProject ? 'featureProject' : 'moveProject', direction=button.dataset.direction;
    renderProjects();
    const activePanel=document.getElementById(root.dataset.view || 'projects')!;
    const replacement=[...activePanel.querySelectorAll<HTMLButtonElement>(action==='featureProject' ? '[data-feature-project]' : '[data-move-project]')].find(item=>item.dataset[action]===id && (action!=='moveProject'||item.dataset.direction===direction) && !item.disabled);
    const fallback=[...activePanel.querySelectorAll<HTMLButtonElement>('[data-edit-project]')].find(item=>item.dataset.editProject===id) || activePanel.querySelector<HTMLButtonElement>('[data-edit-project]') || activePanel.querySelector<HTMLElement>('h2');
    const focusTarget=replacement || fallback;
    if(focusTarget?.tagName==='H2')focusTarget.setAttribute('tabindex','-1');
    focusTarget?.focus({preventScroll:true});
    notify('Profile draft saved in this browser. Your public profile is unchanged.');
  }catch(error){notify(error instanceof Error ? error.message : 'Could not update the profile draft.',true);}
});
function renderShowcase() {
  const selected=showcaseProjects(state,allProjects(),defaultShowcase) as Project[];
  $('#featured-count').textContent=`${selected.length} of ${MAX_FEATURED} selected`;
  $('#showcase-empty').hidden=selected.length>0;
  ($('#export-showcase') as HTMLButtonElement).disabled=selected.length===0;
  const list=$('#showcase-projects');list.replaceChildren();
  selected.forEach((project,index)=>{
    const section=make('section','sw-showcase-project');
    const controls=make('div','sw-showcase-controls');
    const position=make('span','',`${index+1} / ${selected.length}`);
    const edit=make('button','sw-button','Edit story') as HTMLButtonElement;edit.type='button';edit.dataset.editProject=project.id;edit.setAttribute('aria-label',`Edit ${project.name} story`);
    const earlier=make('button','sw-button','Move earlier') as HTMLButtonElement;earlier.type='button';earlier.dataset.moveProject=project.id;earlier.dataset.direction='-1';earlier.disabled=index===0;earlier.setAttribute('aria-label',`Move ${project.name} earlier`);
    const later=make('button','sw-button','Move later') as HTMLButtonElement;later.type='button';later.dataset.moveProject=project.id;later.dataset.direction='1';later.disabled=index===selected.length-1;later.setAttribute('aria-label',`Move ${project.name} later`);
    const remove=make('button','sw-button','Unfeature') as HTMLButtonElement;remove.type='button';remove.dataset.featureProject=project.id;remove.setAttribute('aria-label',`Unfeature ${project.name} from profile draft`);
    controls.append(position,edit,earlier,later,remove);
    section.append(controls,projectPreview(project));list.append(section);
  });
}
$('#export-showcase').addEventListener('click',()=>{
  const draft=exportShowcase(state,allProjects(),defaultShowcase);
  const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sidework-profile-draft.json';anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Profile draft exported. This file is a private backup; it has not been published.');
});

$('#copy-profile').addEventListener('click', async () => {
  const url = new URL('/mager/', location.origin).href;
  try { await navigator.clipboard.writeText(url); notify('Profile link copied. Local drafts and your weekly plan are not included.'); }
  catch { notify(`Copy this profile link: ${url}`); }
});
$('#export-work').addEventListener('click', () => {
  const lines = ['# @mager’s Sidework record', '', 'Public source evidence. Local draft projects are excluded.', '', '## Personal projects', ...seed.projects.map(p => `- [${p.name}](${p.url}) — ${p.description}`), '', '## Selected contributions', ...items.map(p => `- [${p.title}](${p.url}) — ${p.status}; state checked ${p.checkedAt}`), ''];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mager-sidework.md'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Work record exported with source links and snapshot dates.');
});

$('#refresh-github').addEventListener('click', async () => {
  const button = $('#refresh-github') as HTMLButtonElement;
  button.disabled = true; button.querySelector('span')!.textContent = 'Refreshing…';
  $('#refresh-status').textContent = 'Reading public repositories and recent pull requests from GitHub…';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
  const read = async (url: string) => {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub’s public request limit was reached. Try again later.' : `GitHub returned ${response.status}. Try again.`);
    return response.json();
  };
  try {
    const [repos, result] = await Promise.all([
      read('https://api.github.com/users/mager/repos?sort=updated&per_page=30'),
      read('https://api.github.com/search/issues?q=author%3Amager+is%3Apr+is%3Apublic+-user%3Amager&sort=created&order=desc&per_page=30'),
    ]);
    if (!Array.isArray(repos) || !Array.isArray(result.items)) throw new Error('GitHub returned an unexpected response. Try again.');
    const checkedAt = new Date().toISOString().slice(0, 10);
    const latest = result.items.map((item: unknown) => githubContribution(item, checkedAt)).filter(Boolean) as Contribution[];
    importedProjects = repos.filter((repo: any) => !repo.fork && !repo.archived && !repo.private).map((repo: any) => cleanProject({ id: `github-${repo.id}`, name: repo.name, description: repo.description || 'A public project on GitHub.', stack: repo.language || '', url: safeUrl(repo.homepage) || repo.html_url, source: repo.html_url })).filter(Boolean);
    items = [...latest, ...items.filter(item => !latest.some(fresh => fresh.url === item.url))].sort((a, b) => b.date.localeCompare(a.date));
    renderProjects(); renderContributions();
    $('#refresh-status').textContent = `Read ${importedProjects.length} public projects and ${latest.length} recent pull requests. Refreshed ${checkedAt}. These updates last for this visit; the public profile uses its committed snapshot.`;
    $('#contribution-note').textContent = `Recent records refreshed ${checkedAt}. Older entries keep their original check date. This is a selection, not a complete GitHub history.`;
    notify('GitHub refreshed. Your local drafts and weekly plan are unchanged.');
  } catch (error) {
    const reason = error instanceof Error && error.name !== 'AbortError' ? error.message : 'The request timed out. Check your connection and try again.';
    $('#refresh-status').textContent = `${reason} Your existing snapshot is still available.`;
  } finally { clearTimeout(timeout); button.disabled = false; button.querySelector('span')!.textContent = 'Refresh GitHub'; }
});

root.dataset.enhanced = 'true';
showView(location.hash.slice(1)); renderProjects(); renderContributions(); renderPlan();
if (!storageAvailable) notify('Browser storage is unavailable. You can explore, but edits and plans will only last for this visit.', true);
