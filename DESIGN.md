---
name: Sidework
description: An open studio of people and personal software.
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
  display:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(4.5rem, 7vw, 6rem)
    fontWeight: 540
    lineHeight: 1
    letterSpacing: -.04em
  headline:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(2.75rem, 5vw, 5rem)
    fontWeight: 520
    lineHeight: 1.1
    letterSpacing: -.04em
  body:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: .005em
  caption:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.25rem
    lineHeight: 1.5
    letterSpacing: -.015em
  label:
    fontFamily: "'Martian Mono', monospace"
    fontSize: .6875rem
    fontWeight: 400
    lineHeight: 1.8
  workbench-title:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(1.875rem, 1.4rem + 1vw, 2.5rem)
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: -.035em
  entry-display:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(3rem, 6vw, 5.5rem)
    fontWeight: 540
    lineHeight: 1.04
    letterSpacing: -.04em
  import-display:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(2.75rem, 5vw, 4.5rem)
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
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(1.875rem, 3vw, 2.75rem)
    fontWeight: 520
    lineHeight: 1.15
    letterSpacing: -.035em
  story-title:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(2.75rem, 3.5vw, 4.5rem)
    fontWeight: 520
    lineHeight: 1.08
    letterSpacing: -.04em
  story-poster:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: clamp(2.75rem, 4vw, 5rem)
    fontWeight: 540
    lineHeight: 1.05
    letterSpacing: -.04em
rounded:
  status: 4px
  field: 5px
  control: 6px
  preview: 8px
  panel: 10px
  toast: 12px
  popover: 18px
  pill: 30px
  dock: 50px
spacing:
  compact-gap: 8px
  control-gap: 12px
  row-gap: 18px
  panel-inset: 24px
  studio-gap: 160px
  studio-mobile-gap: 100px
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
    rounded: "{rounded.pill}"
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
---

# Design System: Sidework

## Overview

**Creative North Star: "An open studio"**

Sidework is an open studio of people and personal software, with a public @mager profile and invite-only discovery and management tools. Large, compressed lettering and real software previews share a dark moss ground. The maker leads. Project previews change size and position instead of forming a regular public grid.

The same fonts and colors support a denser workbench. Its panels, forms, and evidence rows help people plan work. The studio pages keep more open space. Entry and import pages use the same type and colors with a simpler reading path. All surfaces use clear @handles, direct source links, and plain descriptions. The exact `/mager/` profile route is public. Discovery and management tools require an invite.

**Key Characteristics:**
- People and @handles lead the public experience.
- Real screenshots retain their source colors.
- Variable display type gives identity; distinctive body type supports reading.
- Public previews use depth; the workbench uses quiet borders and tonal layers.
- Keyboard access and reduced motion remain part of each interaction.

This document records the implemented source on November 4, 2026. Visual authority comes from PRODUCT.md and docs/sidework-surface.md. Token and component sources are src/styles/fonts.css, src/styles/sidework.css, src/styles/studio.css, src/components/Studio.astro, and src/pages/workbench.astro. Entry sources are src/styles/entry.css, src/pages/invite.astro, and src/pages/onboarding.astro. Story editing and profile drafts use src/components/ProjectComposer.astro, src/styles/composer.css, src/scripts/project-preview.ts, src/scripts/project-drafts.mjs, src/scripts/sidework.ts, and src/scripts/sidework-state.mjs. Behavior was checked in src/scripts/studio.ts, src/scripts/onboarding.ts, src/scripts/github-import.mjs, src/middleware.ts, src/lib/invite.mjs, and src/components/BaseHead.astro. The current public world replaces the earlier dashboard treatment; unused public selectors in sidework.css do not define it.

## Colors

The palette combines a dark moss ground, pale reading text, and a light green identity accent. The YAML values above are normative; the same color names below describe their use.

### Primary

- **Lime accent:** identity links, selected controls, focus outlines, merged states, and primary workbench actions.
- **Lime ink:** text on filled accent buttons and selected text.

### Secondary

- **Warm state and blue state:** closed and open contribution states. Their text labels remain visible.
- **Clay poster and clay ink:** the authored prxps preview, which has no supplied screenshot.

### Neutral

- **Moss ground, surface, and raised:** page background, contained tools, and selected or raised surfaces.
- **Chalk text and sage muted:** primary reading text and secondary descriptions or metadata.
- **Moss border:** controls, screenshots, and evidence-row dividers.
- **Light tokens:** the explicit light theme replaces the corresponding shared colors. It uses a pale ground, dark text, and a darker green accent. The theme is saved under sidework-theme and applied before paint.

**The Source Color Rule.** Keep real software screenshots in their original colors. Do not tint them to match the interface.

Project markup also declares lavender and other project-tone values. The current stylesheet does not apply those values to visible project treatments. They are not a separate interface palette.

## Typography

**Display Font:** Anybody, with Arial Narrow and sans-serif fallbacks.
**Body Font:** Bricolage Grotesque, with Segoe UI and sans-serif fallbacks.
**Label/Mono Font:** Martian Mono, with a monospace fallback.

All three families use self-hosted Latin WOFF2 subsets with font-display swap. Their SIL licenses are in public/fonts. Anybody supports weights 400–700 and widths 75–100%; Bricolage Grotesque supports weights 400–700 and widths 75–100%; Martian Mono supports weights 400–500 at 87.5% width. Display headings normally use 90% width, with the wordmark at 82%. Public mobile lead type uses 88% width. Bricolage Grotesque replaces Hanken Grotesk throughout the site. Body text uses automatic optical sizing and the tracking in the body token; the entry introduction explicitly resets tracking to zero.

### Hierarchy

- **Display:** the desktop public opening, at the frontmatter display size. At widths from 651px through 1000px it uses clamp(3.5rem, 7.5vw, 5.5rem); at 650px and below it uses clamp(3rem, 12.7vw, 4.75rem), with line height 1.02.
- **Headline:** project titles. Public section headings use nearby weights from 530 to 540. Mobile project and maker headings use 2.75rem.
- **Body:** normal reading text. Project details use line height 1.8 and a maximum measure of 65ch.
- **Caption:** the project purpose beneath its preview. It becomes 1.125rem on mobile.
- **Label:** repository references, stack details, counts, and source metadata. Use compact mono only where it identifies evidence or technical context.
- **Workbench title:** a compact display role. Forms use 1rem input text; ordinary workbench descriptions use smaller Bricolage Grotesque text.
- **Entry display and import display:** the invite and import openings use Anybody at 90% width. The import heading has a maximum measure of 20ch.
- **Entry intro:** a fluid Bricolage Grotesque introduction. On import, its maximum measure is 50ch.
- **Entry meta and entry label:** quiet header/footer text, form labels, and invite contact text. These roles keep the entry page clear without adding decorative labels.
- **Repository title and import note:** selected-source names and the local-draft notice. Repository descriptions retain body size and a maximum measure of 65ch; technical metadata uses the existing mono label.
- **Composer title:** the editing heading uses Anybody at 90% width. At 700px and below, it uses 1.875rem.
- **Story title and story poster:** local previews use Anybody at 90% width. Long names wrap. Story taglines reuse the caption size and line height with a 45ch maximum measure. Story descriptions and build notes use body-size text at line height 1.8 and a 65ch maximum measure.

**The People First Rule.** Use @handles for personal identity. Keep project names and repository owner/name identifiers intact.

## Layout

The public studio is an open vertical sequence, not a regular grid. Above 1000px, the maker sits in the center with an illustrated portrait and previews to either side. The lead scene has a 900px minimum height. The project field has a maximum width of 1800px and 7vw side padding. Homeport, Mood Shell, Perch, and prxps use widths of 78%, 65%, 73%, and 65%, with different offsets. These are current composition values, not a reusable column system.

At 1000px and below, the secondary floating preview is hidden and project widths become 85%. At 650px and below, the lead preview returns to normal flow, each project uses full width, and the field has 24px side padding. Project gaps reduce from the studio gap to the studio mobile gap. At a project container width of 520px or less, caption metadata moves below the description. The 1600px rule caps the lead preview at 900px; its earlier lead-height declaration is superseded by the later desktop rule.

The fixed public dock is centered above the bottom safe area: at least 20px on desktop and 12px on mobile. Footer padding reserves room for it. Its controls remain 46px high; the mobile workbench link keeps its accessible label when its visible text is hidden.

The supporting workbench has a 1536px maximum width. Its desktop shell uses a 204px rail, flexible main area, and 262px context panel. At 1180px these side areas reduce to 180px and 225px. At 960px the context panel disappears and the rail becomes 175px. At 700px the shell becomes one flow, navigation wraps above the content, and forms use one column. Main side padding is 32px by default, 42px from 1440px, 24px at intermediate widths, and 18px on mobile. Dense utility grids belong to this workbench.

Entry pages use a full-height flex column. The invite content is centered in a 700px maximum measure; its form is at most 450px wide. Import uses a 920px maximum content width and a 580px form. Both content areas leave 24px side margins. The header and footer use 28px by 4vw padding, reduced to 22px by 24px at 650px. At that breakpoint, import buttons move to full width, the action bar wraps, and the footer can wrap. The invite input and its submit button remain on one row. Import actions stay visible at the bottom with a sticky ground-colored bar and a top border. These focused utility flows do not change the studio composition.

Story editing and profile drafts hide the workbench context panel. The remaining rail uses the existing 204px, 180px, and 175px responsive widths. Above 960px, the editor has equal form and preview columns with a gap of clamp(28px, 4vw, 64px), reduced to 28px at 1180px. The preview stays 24px below the viewport top, with a maximum height of calc(100dvh - 48px), internal scrolling, and a stable scrollbar gutter. At 960px and below, it follows the form in normal flow with no height cap. At 700px and below, the shell has one content column. Paired form fields already become one column at 1180px.

The private profile draft uses an unboxed sequence. Projects use 90% width; even entries use 80% width and align right. At 960px and below, every project uses full width. Vertical margins change from 64px before and 90px after a project to 44px and 64px on mobile. The controls wrap and keep their order. This local preview borrows the studio’s varied alignment without adding its perspective motion.

## Elevation & Depth

Public depth comes from slightly rotated software windows, restrained perspective, and soft black shadows. Text remains flat. The primary lead preview turns 7 degrees on desktop; the secondary preview turns -8 degrees. Project previews use small turns from -1.5 to 2 degrees. Hover or keyboard focus settles these turns. The dock and saved collection float above the page with their own shadows. Workbench panels rely on tone and borders, without decorative shadows. Entry and import use the same flat treatment. The invite mark has three static elliptical outlines around the branch icon; it is not an animation.

**The Useful Depth Rule.** Use perspective and shadows on software previews and floating controls. Keep reading text on a still plane.

The sidecar records exact shadow and transition values. Preview rotation settles over 0.5–0.55 seconds with cubic-bezier(.16,1,.3,1). Supported browsers add a small scroll-driven perspective and scale change. Native view transitions are enabled; portrait elements share a transition name. The profile handle also has a named transition, but there is no matching discovery handle name. Do not describe that as a complete shared-handle transition.

Reduced motion removes transitions, animations, preview perspective, and preview turns. The existing decorative portrait turns remain static. Details still open, controls still work, and content remains available without the optional animation features.

## Shapes

Public save and follow controls use pill shapes. The dock uses a larger capsule. Screenshot corners are small and become tighter on mobile. Workbench controls use compact rounded corners, while its feature cards use the panel radius. Story forms and their preview remain unboxed. Local story images and clay placeholders use the preview radius and a 16:10 frame. Status labels have the smallest rounding. Portraits vary between circles and soft irregular shapes; they use the existing illustration rather than generic avatar initials.

## Components

### Buttons

Workbench actions have a compact 42px minimum height. Primary actions use the lime fill and lime ink; secondary actions use a transparent fill and moss border. Hover raises the secondary surface and slightly mixes the primary fill with the ground. Disabled buttons use 0.6 opacity and a wait cursor, except disabled profile-draft reorder controls, which use the default cursor. Public Save and Follow buttons are at least 44px high. Their pressed state uses accent text and border, plus an updated text label.

All links, buttons, summaries, and form controls have an accent focus outline (2px) offset by 4px. Search fields instead place the outline around the field group, offset by 2px.

### Chips and status labels

Workbench skill filters are compact rectangular chips. The selected chip has accent text and border on a raised surface. Contribution labels retain explicit merged, open, draft, or closed text; color never replaces the state name.

### Cards / Containers

Public projects are unboxed: identity and title above, preview in the middle, purpose and optional detail below. Containers belong to previews, saved collections, and working tools. The workbench feature card uses a small border, panel radius, and a 20px copy inset. It is a utility pattern, not the public page template.

### Inputs / Fields

Search uses a surface-colored rounded border with a 44px input. Story editor fields use the surface color, control radius, 12px by 14px padding, a 48px minimum height, and 1rem text. Their labels use the entry-label size, with a 9px internal gap and 25px top margin. Help text uses the entry-meta size. Placeholder text uses the muted color at full opacity. Textareas resize vertically. Native required, URL, and length constraints remain active; no separate custom field-error appearance is defined. The workbench feedback notice and story editor alert use the warm state color for errors.

### Navigation

The public dock contains Explore, Saved, @mager, and Workbench. Current-page links use a raised fill; their icon uses the accent. Saved opens a native popover. The workbench uses its separate rail and wrapping mobile navigation. Do not replace the public dock with that rail.

### Project preview and disclosure

Three previews use historical product screenshots. The prxps preview uses an authored clay poster. On desktop, hover or focus reveals an Open action within the preview. On mobile, the action is always visible beneath the image. A native details element exposes descriptions, stack notes, and direct project, source, and build-log links. Its plus icon turns when open; supported browsers animate content height.

### Saved collection and feedback

The saved collection is a native popover with a 420px maximum width, 65dvh maximum height, 24px padding, and an 18px radius. It enters with a short opacity and vertical movement transition. It lists only locally saved known projects. Follow is also a local preference. A polite status message explains storage failures and local follow behavior. Public calls to action lead to the workbench or a project draft; they do not claim to publish.

### Story editor and private profile draft

Edit story opens a local composer and moves keyboard focus to the project name. Name, description, and project URL are required. The short version, stage, stack, screenshot URL and description, source URL, reason for building, and lessons learned are optional. Stage choices are Exploring, Building, Shipped, and Paused. Name, tagline, description, and stack limits are 60, 120, 280, and 80 characters. Each build note allows 1,200 characters; image description allows 180. URL fields allow 2,048 characters.

Text edits update the preview as the user types. The screenshot changes when its field value is committed, rather than loading each partial URL. Existing images remain in place during other text edits. Screenshot links must use HTTPS. Images fit inside the frame without cropping; a failed image becomes a clear message. If no screenshot is present, a clay poster shows the project name. Empty preview fields use clear prompts. Project and source links accept complete HTTP or HTTPS URLs without credentials and open in a new tab with an accessible label.

Native disclosures group screenshot/source fields and longer build notes. Their summaries are at least 48px high; the plus rotates when open. Save draft uses the shared primary button with 12px by 22px padding. Its nearby status distinguishes saved and unsaved text. Leaving a dirty editor asks before discarding changes; closing or reloading uses the browser’s unsaved-change prompt. A failed save keeps both the current form text and the previous saved draft. Editing a seeded project creates a local override; the public snapshot stays unchanged.

Feature and Featured controls use an explicit pressed state. Selected controls have accent text and border on a raised surface. The profile draft holds up to six projects, with a visible position and count. Move earlier and Move later are labeled with the project name and disabled at their limits. After a feature or reorder change, focus returns to an enabled replacement control in the active panel, or to an edit action or section heading. Unfeature removes only the selection. An empty draft has a direct link back to project selection.

Export draft downloads sidework-profile-draft.json with the selected projects and stories in their saved order, a private-draft marker, version, and the prototype handle @mager. It excludes unselected projects and weekly plans. The export is a local copy, not a published profile; no restore flow is implemented. GitHub imports preserve saved stories and profile order.

### Invite and repository import

The invite page has a labeled password field, a primary submit action, and a direct @mager contact link. Entry inputs use the surface color, control radius, 13px by 15px padding, and body text. Their natural height is about 54px at the default root size; no fixed input height is set. Adjacent buttons use the shared 42px minimum height and 20px side padding, then stretch with the row. Errors use warm text and an alert role.

The import page accepts an @handle, reports loading progress, and offers Cancel during loading. Search and native fork/archive checkboxes filter the result list. Forks and archived repositories are included by default. Checkboxes are 20px square with the accent color; each repository has a full clickable label row, a top divider, and 20px vertical padding. Names wrap when necessary. Existing projects have disabled checkboxes and an explicit status. Select matching applies to all matching results, including rows beyond the current 100-row display. Show more reveals another 100 rows.

The sticky action bar keeps the selected count, local-draft notice, and Import action together. The Import action is disabled when the selection is empty and names the selected count when active. Filtering does not clear existing selections; the total remains visible. Success, empty results, API errors, cancellation, and storage errors use text status messages. Imports remain browser-local drafts; public publishing is not connected. The invite opens access with a reusable code and a seven-day session, not an individual account. Lock Sidework clears access without deleting local drafts.

### Footer credit

The studio, workbench, invite, and import footers carry the exact credit “Built with Astra”. It stays at the existing quiet footer size. The studio and workbench credits link to the source repository. The entry footer keeps the source link separate; import provides Lock Sidework.

### Image and font provenance

The @mager portrait is the existing @hopperdraws illustration at public/images/mager.jpg. Homeport, Mood Shell, and Perch screenshot origins are recorded in docs/assets.json; the pages reference the original hosted images. These are historical previews, not live app sessions. Font paths and supported ranges are defined in src/styles/fonts.css, with licenses in public/fonts. No generated image defines this system.

## Do's and Don'ts

### Do:
- **Do** use the self-hosted Anybody, Bricolage Grotesque, and Martian Mono files.
- **Do** place people before their projects on public discovery pages.
- **Do** vary public preview scale and alignment while keeping the reading order clear.
- **Do** show source links, state labels, and check dates with contribution claims.
- **Do** state that saves, follows, imported project drafts, and plans stay in this browser.
- **Do** keep keyboard focus visible and respect reduced motion.

### Don't:
- **Don't** turn public discovery or maker profiles into regular card grids or dashboard columns.
- **Don't** invent people, follower counts, activity totals, testimonials, or live app sessions.
- **Don't** imply that a local draft publishes to the public profile.
- **Don't** extend public display sizes to workbench forms and evidence rows.
- **Don't** recolor the supplied portrait or historical screenshots.
