type Project = {id:string;name:string;tagline:string};
const projectData:Project[] = JSON.parse(document.querySelector('#studio-project-data')?.textContent || '[]');
const known = new Set(projectData.map(p => p.id));
let saved = new Set<string>();
let following = false;
try {
 const raw = JSON.parse(localStorage.getItem('sidework-collection-v1') || '[]');
 if (Array.isArray(raw)) saved = new Set(raw.filter(id => typeof id === 'string' && known.has(id)));
 following = localStorage.getItem('sidework-follow-mager') === 'true';
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
  const link=document.createElement('a');link.href=`${location.pathname}#project-${project.id}`;
  const name=document.createElement('strong');name.textContent=project.name;
  const description=document.createElement('span');description.textContent=project.tagline;
  link.append(name,description);link.addEventListener('click',()=>document.querySelector<HTMLElement>('#saved-projects')?.hidePopover());list.append(link);
 }
}
document.querySelectorAll<HTMLButtonElement>('[data-save-project]').forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.saveProject!;saved.has(id)?saved.delete(id):saved.add(id);renderSaved();
 try {localStorage.setItem('sidework-collection-v1',JSON.stringify([...saved]));}
 catch {feedback('Saved for this visit. Browser storage is not available.');}
}));
const follow=document.querySelector<HTMLButtonElement>('#follow-maker');
const renderFollow=()=>{if(follow){follow.textContent=following?'Following':'Follow';follow.setAttribute('aria-pressed',String(following));}};
follow?.addEventListener('click',()=>{
 following=!following;renderFollow();
 try {localStorage.setItem('sidework-follow-mager',String(following));feedback(following?'Following @mager in this browser. Shared updates are not connected yet.':'Removed @mager from your local follows.');}
 catch {feedback('This preference lasts for this visit. Browser storage is not available.');}
});
document.querySelector('#studio-theme')?.addEventListener('click',()=>{
 const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;
 try{localStorage.setItem('sidework-theme',theme);}catch{}
});
renderSaved();renderFollow();

// Enhance real anchor navigation into a keyboard-accessible project switcher.
const projectBrowser=document.querySelector<HTMLElement>('[data-project-browser]');
if(projectBrowser){
 const tabs=[...projectBrowser.querySelectorAll<HTMLAnchorElement>('[data-project-tab]')];
 const panels=[...projectBrowser.querySelectorAll<HTMLElement>('[data-project-panel]')];
 const tablist=projectBrowser.querySelector<HTMLElement>('.studio-project-tabs')!;
 const select=(id:string,focus=false)=>{
  if(!tabs.some(tab=>tab.dataset.projectTab===id))return;
  for(const tab of tabs){const active=tab.dataset.projectTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus({preventScroll:true});}
  for(const panel of panels)panel.hidden=panel.dataset.projectPanel!==id;
 };
 tablist.setAttribute('role','tablist');
 for(const tab of tabs){
  tab.setAttribute('role','tab');tab.setAttribute('aria-controls',`project-${tab.dataset.projectTab}`);
  tab.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();select(tab.dataset.projectTab!);history.pushState(null,'',tab.hash);});
  tab.addEventListener('keydown',event=>{
   const index=tabs.indexOf(tab);let next:number;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   else if(event.key===' '){event.preventDefault();tab.click();return;}
   else return;
   event.preventDefault();select(tabs[next].dataset.projectTab!,true);history.replaceState(null,'',tabs[next].hash);
   tabs[next].scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
  });
 }
 for(const panel of panels){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`tab-${panel.dataset.projectPanel}`);panel.tabIndex=0;}
 const fromHash=()=>{const id=location.hash.slice('#project-'.length);select(location.hash.startsWith('#project-')&&known.has(id)?id:tabs[0].dataset.projectTab!);};
 projectBrowser.dataset.enhanced='true';fromHash();window.addEventListener('hashchange',fromHash);window.addEventListener('popstate',fromHash);
}
