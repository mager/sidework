import { storageKey } from './storage-key.mjs';
const collectionKey = storageKey('sidework-collection-v1');
const followKey = storageKey('sidework-follow-mager');
type Project = {id:string;name:string;tagline:string};
const projectData:Project[] = JSON.parse(document.querySelector('#studio-project-data')?.textContent || '[]');
const known = new Set(projectData.map(p => p.id));
let saved = new Set<string>();
let following = false;
try {
 const raw = JSON.parse(localStorage.getItem(collectionKey) || '[]');
 if (Array.isArray(raw)) saved = new Set(raw.filter(id => typeof id === 'string' && known.has(id)));
 following = localStorage.getItem(followKey) === 'true';
} catch {}
let feedbackTimer:ReturnType<typeof setTimeout>;
const feedback = (message:string) => {
 const el = document.querySelector<HTMLElement>('#studio-feedback')!;
 el.textContent=message;el.hidden=false;clearTimeout(feedbackTimer);
 feedbackTimer=setTimeout(()=>el.hidden=true,4500);
};
function renderSaved() {
 document.querySelector('#saved-count')!.textContent=String(saved.size);
 document.querySelectorAll<HTMLButtonElement>('[data-save-project]').forEach(button=>{
  const project=projectData.find(p=>p.id===button.dataset.saveProject)!;
  const active=saved.has(project.id);button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',`${active?'Unsave':'Save'} ${project.name}`);
  button.querySelector('span')!.textContent=active?'Saved':'Save';
 });
 const list=document.querySelector('#saved-project-list')!;list.replaceChildren();
 const selected=projectData.filter(p=>saved.has(p.id));
 if (!selected.length) { const p=document.createElement('p');p.textContent='Save a project and come back to it here.';list.append(p); }
 for(const project of selected) {
  const link=document.createElement('a');link.href=`/projects/${project.id}/`;
  const name=document.createElement('strong');name.textContent=project.name;
  const description=document.createElement('span');description.textContent=project.tagline;
  link.append(name,description);link.addEventListener('click',()=>document.querySelector<HTMLElement>('#saved-projects')?.hidePopover());list.append(link);
 }
}
document.querySelectorAll<HTMLButtonElement>('[data-save-project]').forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.saveProject!;saved.has(id)?saved.delete(id):saved.add(id);renderSaved();
 try {localStorage.setItem(collectionKey,JSON.stringify([...saved]));}
 catch {feedback('Saved for this visit. Browser storage is not available.');}
}));
const follow=document.querySelector<HTMLButtonElement>('#follow-maker');
const renderFollow=()=>{if(follow){follow.textContent=following?'Following':'Follow';follow.setAttribute('aria-pressed',String(following));}};
follow?.addEventListener('click',()=>{
 following=!following;renderFollow();
 try {localStorage.setItem(followKey,String(following));feedback(following?'Following @mager in this browser. Shared updates are not connected yet.':'Removed @mager from your local follows.');}
 catch {feedback('This preference lasts for this visit. Browser storage is not available.');}
});
renderSaved();renderFollow();
