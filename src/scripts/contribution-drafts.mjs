export function cleanContributionDraft(value) {
  if (!value || typeof value !== 'object') return null;
  const text = (field, max) => typeof value[field] === 'string' ? value[field].trim().slice(0,max) : '';
  const id=text('id',100), name=text('name',100), handle=text('handle',40), repository=text('repository',200), story=text('story',2000);
  if (!/^[a-zA-Z0-9-]+$/.test(id) || !name || !/^@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(handle) || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository) || !story) return null;
  try {
    const url=new URL(value.evidence);
    if (url.protocol!=='https:' || url.hostname!=='github.com' || url.port || url.username || url.password || !url.pathname.toLowerCase().startsWith(`/${repository.toLowerCase()}/`) || !/^\/[^/]+\/[^/]+\/(pull\/\d+|issues\/\d+|commit\/[a-f0-9]{7,40})\/?$/i.test(url.pathname)) return null;
    return {id,name,handle,repository,story,evidence:url.href};
  } catch { return null; }
}
export function cleanContributionDrafts(value) {
  return Array.isArray(value) ? value.slice(0,20).map(cleanContributionDraft).filter(Boolean).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index) : [];
}
// Workbench tabs do not edit contribution stories. Keep the latest stored stories
// when an older workbench tab saves a project or a weekly plan.
export function withLatestContributionDrafts(raw, state) {
  const stored = raw ? JSON.parse(raw) : null;
  if (stored && stored.version !== 1) throw new Error('The saved workspace cannot be read.');
  return { ...state, contributionDrafts: cleanContributionDrafts(stored?.contributionDrafts) };
}
export function saveContributionDraft(raw, draft) {
  const clean=cleanContributionDraft(draft);
  if (!clean) throw new Error('Add a handle, repository, story, and a GitHub pull request, issue, or commit from that repository.');
  const state=raw?JSON.parse(raw):{version:1,projects:[],plan:{},showcase:[],includeExamples:false};
  if (!state || state.version!==1) throw new Error('The saved workspace cannot be read. Export or restore it before saving.');
  const drafts=cleanContributionDrafts(state.contributionDrafts);
  if (!drafts.some(item=>item.id===clean.id) && drafts.length>=20) throw new Error('This browser has 20 contribution drafts. Edit an existing story.');
  return {...state,contributionDrafts:[clean,...drafts.filter(item=>item.id!==clean.id)]};
}
