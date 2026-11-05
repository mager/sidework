---
name: Sidework
description: People and personal software, with source records in view.
colors:
  moss-ground: "#101310"
  moss-surface: "#171c17"
  moss-raised: "#1e251e"
  chalk-text: "#eef1e9"
  sage-muted: "#a3ad9f"
  moss-border: "#30392f"
  lime-accent: "#b9eb9e"
  lime-ink: "#172512"
  warm-state: "#e9d6ad"
  blue-state: "#b4cbe2"
  clay-poster: "#edc3a0"
  clay-ink: "#29221e"
  light-ground: "#f5f6f0"
  light-surface: "#fffef9"
  light-raised: "#e8ede3"
  light-text: "#1c271b"
  light-muted: "#53614e"
  light-border: "#d2dacb"
  light-accent: "#326823"
  light-accent-ink: "#fff"
  light-warm: "#745925"
  light-blue: "#315d84"
typography:
  wordmark:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: 1.75rem
    fontWeight: 650
    lineHeight: 1
    letterSpacing: -.04em
  display:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(2rem, 3.2vw, 3rem)
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -.025em
  headline:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(1.75rem, 3vw, 2.5rem)
    fontWeight: 550
    lineHeight: 1.25
    letterSpacing: -.025em
  project-title:
    fontFamily: "'Martian Mono', monospace"
    fontSize: clamp(1.5rem, 2.5vw, 2rem)
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -.035em
  body:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: .005em
  caption:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -.015em
  story-caption:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Martian Mono', monospace"
    fontSize: .6875rem
    fontWeight: 400
    lineHeight: 1.8
  code-body:
    fontFamily: "'Martian Mono', monospace"
    fontSize: .8125rem
    fontWeight: 400
    lineHeight: 1.8
  agent-prompt:
    fontFamily: "'Martian Mono', monospace"
    fontSize: .9375rem
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0"
  workbench-title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(1.5rem, 1.1rem + 1vw, 2rem)
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: -.035em
  entry-display:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(2rem, 4vw, 3rem)
    fontWeight: 540
    lineHeight: 1.04
    letterSpacing: -.04em
  entry-intro:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(1.125rem, 2vw, 1.375rem)
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  entry-meta:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: .8125rem
    fontWeight: 400
    lineHeight: 1.6
  entry-label:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: .9375rem
    fontWeight: 400
    lineHeight: 1.6
  repository-title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.1875rem
    fontWeight: 550
    lineHeight: 1.6
  import-note:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: .875rem
    fontWeight: 400
    lineHeight: 1.6
  composer-title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(1.5rem, 2.5vw, 2rem)
    fontWeight: 520
    lineHeight: 1.15
    letterSpacing: -.035em
  story-title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(1.75rem, 3vw, 2.5rem)
    fontWeight: 520
    lineHeight: 1.08
    letterSpacing: -.04em
  story-poster:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: clamp(2rem, 3vw, 3rem)
    fontWeight: 540
    lineHeight: 1.05
    letterSpacing: -.04em
  utility-button:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: .75rem
    fontWeight: 500
    lineHeight: 1.5
  agent-purpose:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.7
rounded:
  mobile-dock-control: 3px
  status: 4px
  control: 6px
  preview: 8px
  panel: 4px
  toast: 12px
  popover: 6px
  dock: 6px
spacing:
  compact-gap: 8px
  control-gap: 12px
  row-gap: 18px
  panel-inset: 24px
  studio-gap: 88px
  studio-mobile-gap: 60px
components:
  button-primary:
    backgroundColor: "{colors.lime-accent}"
    textColor: "{colors.lime-ink}"
    rounded: "{rounded.control}"
    padding: 9px 13px
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 9px 13px
  save-button:
    backgroundColor: "{colors.moss-ground}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.status}"
    padding: 10px 15px
  search-field:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 0 13px
  filter-chip:
    backgroundColor: transparent
    textColor: "{colors.sage-muted}"
    rounded: "{rounded.control}"
    padding: 9px 13px
  status-merged:
    textColor: "{colors.lime-accent}"
    rounded: "{rounded.status}"
    padding: 2px 7px
  workbench-feature:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.panel}"
  studio-dock:
    textColor: "{colors.sage-muted}"
    rounded: "{rounded.dock}"
    padding: 7px
    backgroundColor: "{colors.moss-ground}"
  project-story:
    textColor: "{colors.sage-muted}"
  saved-collection:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.popover}"
    padding: 24px
  entry-field:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 13px 15px
    typography: "{typography.body}"
  repository-row:
    textColor: "{colors.chalk-text}"
    padding: 20px 0
  story-field:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 12px 14px
    typography: "{typography.body}"
  feature-selected:
    backgroundColor: "{colors.moss-raised}"
    textColor: "{colors.lime-accent}"
    rounded: "{rounded.control}"
    padding: 9px 13px
  profile-manifest:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.status}"
    typography: "{typography.code-body}"
---

# Design System: Sidework

## Overview

**Creative North Star: "An open studio, with source in view"**

Sidework is an open studio of people and personal software. Compact headings, straight screenshots, and visible source records make the software easy to inspect. The maker and @handle remain the starting point. Uneven project widths preserve the studio’s open sequence without a regular public card grid.

The public-facing studio supports browsing; the workbench supports editing, import, and agent review. Both use moss surfaces, lime actions, Bricolage Grotesque reading text, and Martian Mono technical content. Anybody is reserved for the wordmark. The exact /mager/ profile is public; discovery and management need an invite. Agent access uses a separate scoped token.

**Key Characteristics:**
- People and @handles lead; source evidence stays visible.
- Compact Bricolage headings and mono project names replace large display treatments.
- Real screenshots stay straight and retain their original colors.
- The public sequence remains asymmetric; management uses compact controls.
- Local drafts, review, and public records remain distinct.

This records the approved November 4, 2026 refinement. Source authority is the applied cascade in src/styles/sidework.css, studio.css, entry.css, composer.css, and agents.css, plus src/components/Studio.astro. The later source-first studio rules override earlier decorative rules. PRODUCT.md and docs/sidework-surface.md record product scope and review. Fonts come from src/styles/fonts.css; images from docs/assets.json. This is a refinement of the existing world.

## Colors

The palette stays moss, lime, and pale text. Frontmatter values are normative. Dark is the default; an explicit light choice is stored under sidework-theme and applied before paint.

### Primary

Lime accent marks identity links, actions, focus, selected states, and JSON string values. Lime ink supplies text on filled accent controls.

### Secondary

Blue state identifies open contributions and JSON keys. Warm state identifies closed contributions and errors. Clay remains only in local story placeholders; the public prxps poster now uses the shared surface, text, and lime colors.

### Neutral

Ground, surface, and raised moss tones separate content. Chalk is primary text; sage is secondary text and code punctuation. Moss borders define fields, file headers, screenshots, and evidence rows. Light tokens replace their dark counterparts without changing roles. Screenshots retain their source colors in both themes.

**The Source Color Rule.** Keep real software screenshots in their original colors. Do not tint them to match the interface.

## Typography

**Brand Font:** Anybody, with Arial Narrow and sans-serif fallbacks.
**Heading and Body Font:** Bricolage Grotesque, with Segoe UI and sans-serif fallbacks.
**Code Font:** Martian Mono, with a monospace fallback.

All use self-hosted Latin WOFF2 subsets and font-display swap. Anybody and Bricolage support weights 400–700 and widths 75–100%; Martian Mono supports weights 400–500 at 87.5% width. Body text uses automatic optical sizing and the body tracking token. The wordmark uses 82% width. Compact utility, entry, and story headings retain 90% width where the source specifies it.

### Hierarchy

- **Wordmark:** brand use only. Public mobile wordmarks reduce to 1.5rem; the workbench wordmark uses 1.5625rem.
- **Display and headline:** compact public openings and section titles. At 650px and below, they use 2rem and 1.75rem respectively.
- **Project title:** public software names in Martian Mono. Mobile titles use 1.5rem. The profile heading’s @handle uses mono at 0.9em; the discovery maker link uses 1rem mono.
- **Body and caption:** reading and public project purpose. Details and local story notes use body size with line height 1.8 and a maximum measure of 65ch. Local story taglines use the larger story-caption role and 45ch measure.
- **Code body and label:** manifest, commands, repository paths, stacks, counts, and evidence. Agent prompts use the separate mono prompt role.
- **Workbench, entry, composer, and story titles:** smaller Bricolage roles for the task at hand. Entry introductions retain their fluid reading size. The composer heading is 1.875rem at 700px and below.
- **Entry labels, metadata, notices, and utility buttons:** compact reusable control roles. Form text remains 1rem. Agent purpose text uses the recorded 1.0625rem reading role.

**The Type Roles Rule.** Use Anybody for the wordmark, Bricolage Grotesque for headings and reading, and Martian Mono for code, source metadata, and public project names.

## Layout

The public opening has a maximum width of 1600px, 6vw side padding, and 660px minimum height. Its copy occupies 39%; the straight lead preview occupies 47% at the right. A smaller preview uses 24% width near the lower right. The manifest is at most 420px wide. At 651–1000px, the opening uses 690px minimum height, 5vw side padding, 44% copy, 43% lead preview, and a 35% secondary preview. At 650px and below, the opening has no minimum height, uses 22px side padding, puts the lead image in normal flow, and hides the secondary preview.

The project field has a 1440px maximum width and 7vw side padding. Homeport, Mood Shell, Perch, and prxps retain widths of 78%, 65%, 73%, and 65%, with different offsets. At intermediate widths the projects use 85%; on mobile they use full width with 22px page padding. The vertical project gap is 88px, reduced to 60px on mobile. At a 520px project container width, caption metadata moves below the purpose. Stack and source rows wrap independently.

The rectangular public dock stays centered above the bottom safe area, at least 20px on desktop and 12px on mobile. Its controls remain 46px high. Footer spacing keeps content clear of it. The mobile workbench link retains an accessible label when its visible text is hidden.

The workbench has a 1536px maximum width, a 204px rail, flexible main area, and 262px context panel. At 1180px side areas reduce to 180px and 225px. At 960px the context panel disappears and the rail becomes 175px. At 700px the shell becomes one flow with wrapping navigation. Main side padding is 32px, 42px from 1440px, 24px at intermediate widths, and 18px on mobile.

Editor, showcase, Agents, and Review hide the context panel. The editor splits form and preview equally above 960px, with a clamp(28px, 4vw, 64px) gap, reduced to 28px at 1180px. Its preview sticks 24px below the top, with internal scrolling capped at calc(100dvh - 48px). At 960px it follows the form without a height cap. Paired form fields stack at 1180px. Private showcase entries alternate 90% and 80% widths, become full width at 960px, and reduce vertical margins on mobile.

Entry content is at most 700px for invites and 920px for import, with 24px side margins; forms are at most 450px and 580px. At 650px import actions and footers wrap, and the import form button uses full width. Its bottom action bar remains sticky. Agents content is at most 960px wide. Commands and manual-copy text wrap or scroll inside their own surfaces.

## Elevation & Depth

Software images and portraits are straight, with no perspective, decorative scroll animation, or image shadows. Small borders and surface tones supply separation. The public prxps preview is a flat surface with mono identity, not a large colored poster. Local unsupplied-image placeholders retain their clay treatment.

**The Still Software Rule.** Keep software previews straight and still. Use borders and surface tones for separation; reserve shadows for floating controls and feedback.

The sidecar records the remaining dock, saved-popover, action, and feedback shadows. Ordinary button transitions remain 160ms. The desktop Open action still fades and moves a few pixels; disclosure height and saved-popover entry are native progressive enhancements. Native cross-document view transitions remain enabled, including named maker elements. Reduced motion removes animations, transitions, and smooth scrolling. No depth effect is needed to understand or operate a page.

## Shapes

Use compact rectangles. The shared panel radius is 4px. Public screenshots, manifest, Save, Follow, and Open controls use 4px corners. Dock and saved popover use 6px corners; dock items use 4px, or 3px on mobile. Workbench and entry fields retain 6px corners. Local story media retain 8px corners and a 16:10 frame. Lead identity portraits use 6px corners; smaller bylines and dock avatars remain circular. The toast retains its 12px radius.

## Components

### Buttons and fields

Workbench buttons retain a 42px minimum height, 6px radius, and 9px by 13px padding. Primary actions use lime fill; secondary actions use a transparent fill and border. Hover raises the surface. Disabled actions use 0.6 opacity; disabled reorder controls use a default cursor. Public Save and Follow remain at least 44px high with explicit pressed states.

Story fields and token fields use 48px minimum height and 12px by 14px padding. Entry fields use 13px by 15px padding. Textareas resize vertically. Focus uses a 2px accent outline offset 4px; the search group uses a 2px offset. Native required, URL, and length constraints remain. Error text uses the warm color.

### Source manifest and preview

The visible profile.json block contains real @mager and project IDs from the same records as the page. Each project value links to its section. It is valid JSON rendered as navigable text, not a fake editor or terminal session. The file row has 10px by 14px padding; code has 16px padding. Keys use blue, string values lime, and punctuation muted text. The GitHub link remains direct.

The lead image has a real repository-path header. Each public project exposes its stack and repository link before the screenshot, or a build-log link when no source URL exists. Screenshot previews link to the project. Open appears on desktop hover or keyboard focus and stays visible on mobile. README is a native disclosure for the description, notes, and source/build links. Its plus changes state when open. All three screenshots remain historical images, not live sessions.

### Dock, collection, and feedback

The dock uses an opaque ground fill, border, compact rectangle, and modest shadow; there is no glass blur. Current-page and hover states use the raised surface. Saved opens a native popover, up to 420px wide and 65dvh high, with 24px padding and 6px corners. Saves and follows are local preferences. Status messages explain failures and do not imply public updates.

### Workbench stories and review

Forms edit name, purpose, tagline, stage, stack, screenshot and alt text, source, motivation, and learning. Text updates the live preview; screenshot updates wait for a committed field change. HTTPS images fit without cropping and show a failure message if needed. Save failures keep unsaved text and previous stored state. Seed edits are local overrides; the public snapshot stays unchanged.

Up to six projects form a private ordered draft. Feature has a pressed state; named earlier/later buttons retain focus after rerender and disable at their limits. Export contains selected stories in order and @mager. Review a draft file restores the version 1 format after explicit review and Save these projects. Agent links use the same review path. Matching stories and order are updated together; other projects and plans remain. There is no public publishing action.

### Agents and import

The Agents prompt is mono text on a bordered surface, with 18px by 20px padding and a 68ch maximum measure. Three steps cover a scoped token, client setup, and draft review. Copy failure exposes the exact requested text in a labeled readonly field, focuses and selects it; Hide clears it. Tokens stay in page memory. Review links carry compressed fragments, not a server inbox. Agents read evidence and prepare drafts; they cannot save browser state or publish.

GitHub import supports public owned repositories, search, fork/archive filters, bulk selection, and rows revealed 100 at a time. It preserves stories and draft order. Selection and local-save limits remain explicit. Review and import status messages cover loading, empty results, invalid data, and storage errors. docs/agents.md defines the integration limits.

### Provenance and footer

The portrait is the existing @hopperdraws illustration. Screenshot origins are in docs/assets.json; they keep their original colors. Font licenses are in public/fonts. Every main footer carries “Built with Astra”. No generated image or simulated developer activity defines this system.

## Do's and Don'ts

### Do:
- **Do** use @handles for people and preserve repository owner/name identifiers.
- **Do** expose the real stack and source link before each public project preview.
- **Do** keep the profile manifest tied to the same project records and working anchors.
- **Do** retain uneven public project widths and a clear mobile reading order.
- **Do** keep keyboard focus visible and support reduced motion.
- **Do** state that reviewed drafts save in this browser and do not publish.

### Don't:
- **Don't** use Anybody for content headings.
- **Don't** add tilted screenshots, perspective drift, or a simulated terminal.
- **Don't** turn the public studio into a regular card grid.
- **Don't** invent source records, people, activity counts, or learning outcomes.
- **Don't** claim that an agent can read local drafts or publish a profile.
