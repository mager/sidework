import { openDraftWorkspace } from './draft-storage';
import { STORAGE_KEY, readState } from './sidework-state.mjs';
import { fetchRepositories, githubHandle, importSelection, projectKey } from './github-import.mjs';
async function startImport() {
const $ = (id:string) => document.getElementById(id)!;
const input = (id:string) => $(id) as HTMLInputElement;
const button = (id:string) => $(id) as HTMLButtonElement;
const seed = JSON.parse($('import-seed').textContent!);
const workspace=await openDraftWorkspace($('main'),seed.projects,()=>{loadExisting();render();});
if(!workspace)return;
let repos:any[] = [], selected = new Set<string>(), existing = new Set<string>(), visible = 100;
let controller:AbortController | null = null;
const status = (message:string) => { $('import-status').textContent = message; };
function loadExisting() {
  const state = readState(JSON.stringify(workspace!.read()), seed.opportunityIds);
  existing = new Set([...(state.includeExamples ? seed.projects : []),...state.projects].map(projectKey));
}
function matching() {
  const term = input('repo-search').value.trim().toLowerCase();
  return repos.filter(repo => (input('include-forks').checked || !repo.fork) && (input('include-archived').checked || !repo.archived) && `${repo.fullName} ${repo.project.description} ${repo.project.stack}`.toLowerCase().includes(term));
}
function updateSelection() {
  $('selection-count').textContent = `${selected.size} selected`;
  button('import-selected').disabled = selected.size === 0;
  button('import-selected').textContent = selected.size ? `Import ${selected.size} ${selected.size === 1 ? 'project' : 'projects'}` : 'Import selected';
}
function render() {
  const matches = matching();
  $('repo-count').textContent = matches.length ? `${matches.length} matching ${matches.length === 1 ? 'repository' : 'repositories'} · ${repos.length} total` : 'No repositories match. Change the search or filters.';
  $('repo-list').replaceChildren();
  for (const repo of matches.slice(0,visible)) {
    const key = projectKey(repo.project), added = existing.has(key);
    const li = document.createElement('li'); li.className='repo-row';
    const label = document.createElement('label'), checkbox = document.createElement('input'); checkbox.type='checkbox'; checkbox.checked=selected.has(key); checkbox.disabled=added;
    checkbox.addEventListener('change',()=>{ if (checkbox.checked) selected.add(key); else selected.delete(key); updateSelection(); });
    const copy=document.createElement('span'); copy.className='repo-copy';
    const name=document.createElement('strong'); name.textContent=repo.fullName;
    const description=document.createElement('p'); description.textContent=repo.project.description || 'No description on GitHub yet.';
    const meta=document.createElement('small'); meta.textContent=[repo.project.stack,repo.fork?'Fork':'Original',repo.archived?'Archived':'',added?'Already in your workbench':''].filter(Boolean).join(' · ');
    copy.append(name,description,meta); label.append(checkbox,copy); li.append(label); $('repo-list').append(li);
  }
  $('show-more').hidden=matches.length<=visible; updateSelection();
}
$('github-import-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(controller) return;
  let handle:string;
  try { handle=githubHandle(input('github-handle').value); loadExisting(); } catch(error:any) { status(error instanceof Error && error.name !== 'SecurityError' ? error.message : 'Browser storage is blocked. Allow storage to import projects.'); return; }
  selected.clear(); repos=[]; $('repo-results').hidden=true; $('import-result').hidden=true;
  const current = new AbortController(); controller=current;
  const timeout=setTimeout(()=>current.abort(),120000);
  button('find-repos').disabled=true; $('cancel-import').hidden=false; status(`Finding @${handle}’s public repositories…`);
  try {
    repos=await fetchRepositories(handle,{ signal:current.signal, onProgress:(count:number)=>status(`Found ${count} public repositories for @${handle}. Reading the next page…`) });
    status(repos.length ? `Found all ${repos.length} public repositories owned by @${handle}. Choose what to import.` : `@${handle} has no public repositories to import.`);
    visible=100; $('repo-results').hidden= !repos.length; render();
  } catch(error:any) { status(current.signal.aborted ? 'Search stopped. Try again when you are ready.' : error.message); }
  finally { clearTimeout(timeout); controller=null; button('find-repos').disabled=false; $('cancel-import').hidden=true; }
});
$('cancel-import').addEventListener('click',()=>controller?.abort());
for (const id of ['repo-search','include-forks','include-archived']) $(id).addEventListener('input',()=>{visible=100;render();});
$('select-matching').addEventListener('click',()=>{for(const repo of matching()){const key=projectKey(repo.project);if(!existing.has(key))selected.add(key);}render();});
$('clear-selection').addEventListener('click',()=>{selected.clear();render();});
$('show-more').addEventListener('click',()=>{visible+=100;render();});
$('import-selected').addEventListener('click',async()=>{
  try {
    const chosen=repos.filter(repo=>selected.has(projectKey(repo.project))).map(repo=>repo.project);
    const result=importSelection(JSON.stringify(workspace.read()),chosen,seed.projects,seed.opportunityIds);
    button('import-selected').disabled=true;
    await workspace.save(result.value,{projectsOnly:true});
    selected.clear(); loadExisting(); render();
    $('import-result-text').textContent=`${result.count} ${result.count===1?'project imported':'projects imported'}. Your drafts are saved ${workspace.account?'to your account':'in this browser'}.`;
    $('import-result').hidden=false;
    $('import-result').scrollIntoView({block:'nearest'});
  }catch(error:any){status(error?.name==='QuotaExceededError'?'This browser is out of storage. Remove old drafts or select fewer projects. Your existing drafts are unchanged.':error?.name==='SecurityError'?'Browser storage is blocked. Allow storage and try again.':error.message || 'Could not save. Please try again.');}
  finally{updateSelection();}
});

}
void startImport();
