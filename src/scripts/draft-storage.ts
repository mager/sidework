import { createDraftWorkspace } from './account-workspace.mjs';
import { browserDraftIdentity } from './draft-identity.mjs';
import { STORAGE_KEY } from './sidework-state.mjs';
import { MAX_ACCOUNT_DRAFT_BYTES } from './account-draft-data.mjs';

export async function openDraftWorkspace(root: HTMLElement, seed: any[] = [], changed = () => {}, canImport = () => true) {
 const identity = browserDraftIdentity();
 const panel = document.getElementById('draft-storage');
 const publicSeed=document.getElementById('draft-storage-seed')?.textContent;
 if(publicSeed)seed=JSON.parse(publicSeed);
 const element = (id:string) => document.getElementById(`draft-storage-${id}`)!;
 let loaded = false, pendingReview:any = null, reviewRevision:number|null = null, workspace:any;
 const message = (text:string) => { if(panel) element('status').textContent=text; };
 const download = (value:any) => {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='sidework-account-drafts.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const unavailableStorage = { getItem:()=>{throw new Error('Browser storage is unavailable.');}, setItem:()=>{throw new Error('Browser storage is unavailable.');} };
 let storage: Storage | typeof unavailableStorage;
 try { storage=localStorage; } catch { storage=unavailableStorage; }
 workspace=createDraftWorkspace({identity,storage,key:STORAGE_KEY,onStatus:({phase,message:text}:any)=>{
  if (!panel) return;
  root.inert=phase==='loading'||phase==='saving'||!loaded;
  message(text);panel.toggleAttribute('data-error',phase==='error');
  element('retry').hidden=phase!=='error'||loaded;
  element('tools').hidden=!loaded;
  element('recovery').hidden=phase!=='error'||!workspace?.recovery();
 }});
 if(identity)root.inert=true;
 try { await workspace.load();loaded=true;root.inert=false;if(panel)element('tools').hidden=false; }
 catch(error:any) { if(!panel){const note=document.createElement('p');note.className='sw-notice';note.setAttribute('role','alert');note.textContent=error.message;root.before(note);} return null; }
 if(!panel)return workspace;
 const review = (drafts:any, overwrite:boolean) => {
  pendingReview=drafts;
  reviewRevision=workspace.revision;
  const current=workspace.read();
  element('review-note').textContent=`${drafts.projects.length} projects · ${drafts.contributionDrafts.length} contributions. ${overwrite?`This replaces all account drafts and featured order. Currently saved: ${current.projects.length} projects and ${current.contributionDrafts.length} contributions. Download account drafts first to keep a copy.`:'Saved account stories and featured order take priority. Browser originals stay unchanged.'} Nothing is published.`;
  element('confirm').textContent=overwrite?'Restore this backup':'Save to my account';
  const list=element('review-list');list.replaceChildren();
  for(const [kind,items] of [['Project',drafts.projects],['Contribution',drafts.contributionDrafts]] as const)for(const item of items){const li=document.createElement('li');li.textContent=`${kind}: ${item.name}${drafts.showcase.includes(item.id)?' · Featured':''}`;list.append(li);}
  element('review').hidden=false;element('review-title').setAttribute('tabindex','-1');element('review-title').focus();
 };
 element('export').addEventListener('click',()=>{try{download(workspace.backup());}catch(error:any){message(error.message);}});
 element('recovery').addEventListener('click',()=>{const copy=workspace.recovery();if(copy){download(copy);message('Downloaded the last save attempt. If you edited the form after that attempt, press Save again before downloading a new copy.');}});
 element('import').addEventListener('click',()=>{try{review(workspace.reviewBrowserImport(seed),false);}catch(error:any){message(error.message);}});
 element('file').addEventListener('change',async event=>{
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;
  try{if(file.size>MAX_ACCOUNT_DRAFT_BYTES+512)throw new Error('Choose an account backup smaller than 700 KB.');review(workspace.reviewRecovery(JSON.parse(await file.text())),true);}
  catch(error:any){message(error instanceof SyntaxError?'Choose a valid Sidework JSON backup.':error.message);}
  finally{input.value='';}
 });
 element('cancel').addEventListener('click',()=>{pendingReview=null;element('review').hidden=true;element('import').focus();});
 element('confirm').addEventListener('click',async()=>{
  if(!pendingReview)return;
  if(reviewRevision!==workspace.revision){pendingReview=null;element('review').hidden=true;message('Drafts changed while this review was open. Review the import again before saving.');element('import').focus();return;}
  if(!canImport())return;
  const button=element('confirm') as HTMLButtonElement;button.disabled=true;
  try{await workspace.save({...workspace.read(),...pendingReview});pendingReview=null;element('review').hidden=true;changed();message('Reviewed drafts saved to your account.');}
  catch(error:any){message(error.message);}
  finally{button.disabled=false;}
 });
 window.addEventListener('beforeunload',event=>{if(workspace.busy||workspace.recovery()){event.preventDefault();event.returnValue='';}});
 return workspace;
}

// Retry an initial load with a fresh page. No editor is active before that load.
document.getElementById('draft-storage-retry')?.addEventListener('click',()=>location.reload());
