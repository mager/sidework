import { validShowcaseSlug } from '../scripts/showcase-path.mjs';

// Call only with the public snapshot returned by publicBySlug, never account drafts.
export function showcaseMetadata(content, slug, origin) {
  if (!content?.project || !validShowcaseSlug(slug)) return null;
  const canonical = new URL(`/showcase/${slug}/`, origin).href;
  return {
    title: `${content.project.name} by ${content.handle} · Sidework`,
    description: content.project.tagline || content.project.description || `Personal software by ${content.handle}.`,
    canonical,
    image: `${canonical}?image=share`,
    imageWidth: 1200,
    imageHeight: 630,
  };
}
