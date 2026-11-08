import { cleanContributionDrafts, saveContributionDraft } from './contribution-drafts.mjs';
import { openDraftWorkspace } from './draft-storage';
import { browserDraftIdentity } from './draft-identity.mjs';
import { STORAGE_KEY } from './sidework-state.mjs';
async function startContributionEditor() {
const form=document.querySelector<HTMLFormElement>('#contribution-form')!;
const status=document.querySelector<HTMLElement>('#contribution-status')!;
const list=document.querySelector<HTMLElement>('#contribution-draft-list')!;
const editor=document.querySelector<HTMLElement>('#contribution-editor')!;
let currentId=crypto.randomUUID(), dirty=false;
const fields=['name','handle','repository','story','evidence'];
const workspace=await openDraftWorkspace(document.getElementById('contribution-workspace')!,[],()=>{dirty=false;currentId=crypto.randomUUID();form.reset();setHandle();load();preview();},()=>!dirty||confirm('Discard the unsaved changes in this editor?'));
if(!workspace)return;
function setHandle(){const identity=browserDraftIdentity();if(identity)field('handle').value=identity.handle;}
const field=(name:string)=>form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
const message=(text:string)=>{status.textContent=text;};
function preview() {
 for (const [key,fallback] of Object.entries({name:'Your project contribution',repository:'Upstream repository',story:'Explain what you added, fixed, tested, or documented.',handle:'Your @handle'})) document.querySelector(`#preview-${key}`)!.textContent=field(key).value.trim()||fallback;
}
function load() {
 list.replaceChildren();
 try {
  const raw=JSON.stringify(workspace!.read());
  const data=raw?JSON.parse(raw):null;
  if (data && data.version!==1) throw new Error();
  const drafts=cleanContributionDrafts(data?.contributionDrafts);
  if (!drafts.length) {const p=document.createElement('p');p.textContent='No contribution stories yet. Write your first story above.';list.append(p);}
  for (const draft of drafts) {
   const article=document.createElement('article'), info=document.createElement('div'), heading=document.createElement('h3'), note=document.createElement('p'), button=document.createElement('button');
   heading.textContent=draft.name;note.textContent=`${draft.handle} · ${draft.repository} · Private draft`;
   button.type='button';button.className='sw-button';button.textContent='Edit story';button.setAttribute('aria-label',`Edit ${draft.name}`);
   button.addEventListener('click',()=>{if(dirty&&!confirm('Discard the changes that you have not saved?'))return;currentId=draft.id;for(const key of fields)field(key).value=draft[key];dirty=false;preview();message('Editing a private draft.');field('name').focus();});
   info.append(heading,note);article.append(info,button);list.append(article);
  }
 } catch { message('The saved drafts cannot be read. Check browser storage or restore your workspace in Settings.'); }
}
form.addEventListener('input',()=>{dirty=true;preview();});
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const draft=Object.fromEntries(fields.map(key=>[key,field(key).value]));
 try { const next=saveContributionDraft(JSON.stringify(workspace.read()),{...draft,id:currentId});await workspace.save(next);dirty=false;load();message(`Private draft saved ${workspace.account?'to your account':'in this browser'}. It has not been published.`); }
 catch(error) { message(error instanceof SyntaxError?'The saved workspace cannot be read. Restore it in Settings before saving.':error instanceof Error?error.message:'The draft could not be saved. Your text is still here. Check browser storage and try again.'); }
});
document.querySelector('#new-contribution')!.addEventListener('click',()=>{if(dirty&&!confirm('Discard the changes that you have not saved?'))return;currentId=crypto.randomUUID();form.reset();setHandle();dirty=false;preview();message('New private story.');field('name').focus();});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY)load();});
editor.hidden=false;setHandle();load();preview();

}
void startContributionEditor();
