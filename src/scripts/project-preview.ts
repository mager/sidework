import { safeUrl } from './sidework-state.mjs';
import { STAGES } from './project-drafts.mjs';
import { PROJECT_CATEGORIES, SOFTWARE_TYPES, cleanMetadata } from './project-metadata.mjs';
const element = (tag:string, className:string, text='') => { const node=document.createElement(tag);node.className=className;node.textContent=text;return node; };
export function projectPreview(project:any) {
  const article=element('article','sw-story-preview');
  const title=element('h3','sw-story-title',project.name || 'Your next good idea');
  const tagline=element('p','sw-story-tagline',project.tagline || 'Give your project a sentence of its own.');
  article.append(title,tagline);
  const stage=STAGES[project.stage as keyof typeof STAGES];
  if(stage) article.append(element('span','sw-story-stage',stage));
  const imageUrl=safeUrl(project.image);
  if(imageUrl.startsWith('https://')) {
    const frame=element('div','sw-story-image');
    const img=document.createElement('img');img.src=imageUrl;img.alt=project.imageAlt || `${project.name || 'Project'} screenshot`;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>{frame.replaceChildren(element('p','sw-image-error','The screenshot could not load. Check the image link.'));},{once:true});
    frame.append(img);article.append(frame);
  } else {
    const poster=element('div','sw-story-poster');poster.setAttribute('aria-hidden','true');poster.append(element('span','',project.name || 'Something worth making.'));article.append(poster);
  }
  article.append(element('p','sw-story-description',project.description || 'Tell people what it does, who it helps, and what makes it yours.'));
  const metadata = cleanMetadata(project);
  const classification = [PROJECT_CATEGORIES[metadata.category], SOFTWARE_TYPES[metadata.softwareType]].filter(Boolean).join(' · ');
  if (classification) article.append(element('p','sw-story-stack',classification));
  if (metadata.audience) {
    const section = element('section','sw-story-note');
    section.append(element('h4','','Who it helps'),element('p','',metadata.audience));article.append(section);
  }
  if (metadata.features.length) {
    const section = element('section','sw-story-note'), list = element('ul','sw-story-features');
    for (const feature of metadata.features) list.append(element('li','',feature));
    section.append(element('h4','','What you can do'),list);article.append(section);
  }
  if(project.stack) article.append(element('p','sw-story-stack',project.stack));
  for(const [key,label] of [['whyBuilt','Why I built it'],['learned','What I learned']]) if(project[key]) {const section=element('section','sw-story-note');section.append(element('h4','',label),element('p','',project[key]));article.append(section);}
  const links=element('div','sw-story-links');
  for(const [key,label] of [['url','Try the project'],['source','View source']]) {
    const href=safeUrl(project[key]); if(!href) continue;
    const link=document.createElement('a');link.href=href;link.textContent=label;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${label} (opens in a new tab)`);links.append(link);
  }
  article.append(links);return article;
}
