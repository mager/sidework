---
name: Sidework
description: A compact browser for personal software and source evidence.
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
    fontSize: 1.5rem
    fontWeight: 650
    lineHeight: 1
    letterSpacing: -.04em
  project-title:
    fontFamily: "'Martian Mono', monospace"
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -.025em
  body:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: .005em
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
  entry-wordmark:
    fontFamily: "'Anybody', 'Arial Narrow', sans-serif"
    fontSize: 1.75rem
    fontWeight: 650
    lineHeight: 1
    letterSpacing: -.04em
  maker-handle:
    fontFamily: "'Martian Mono', monospace"
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -.025em
  project-tab:
    fontFamily: "'Martian Mono', monospace"
    fontSize: .8125rem
    fontWeight: 500
    lineHeight: 1.6
  project-purpose:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.125rem
    fontWeight: 550
    lineHeight: 1.4
  project-description:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: .875rem
    fontWeight: 400
    lineHeight: 1.7
  discovery-title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', sans-serif"
    fontSize: 1.25rem
    fontWeight: 550
    lineHeight: 1.22
rounded:
  status: 4px
  control: 6px
  preview: 8px
  panel: 4px
  toast: 6px
  popover: 6px
spacing:
  compact-gap: 8px
  control-gap: 12px
  row-gap: 18px
  panel-inset: 24px
  browser-inset: 24px
  browser-pane-gap: 28px
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
    backgroundColor: transparent
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 9px 13px
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
  public-navigation:
    backgroundColor: "{colors.moss-ground}"
    textColor: "{colors.sage-muted}"
    padding: 12px 28px
  project-switcher:
    backgroundColor: "{colors.moss-surface}"
    textColor: "{colors.sage-muted}"
    typography: "{typography.project-tab}"
  project-browser:
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: 24px
---

# Design System: Sidework

## Overview

**Creative North Star: "A software browser"**

Sidework presents personal software as a compact browser. A maker row and the latest actual contribution lead into a horizontal project switcher. One selected project pairs a screenshot with its purpose, stack, notes, source, and app link. Six compact contribution rows complete the public record.

Public browsing and the separate workbench both use Operate mode: choose, inspect, and act. The workbench retains its editor, private showcase, import, and agent review flows. Moss surfaces, lime actions, Bricolage Grotesque reading text, Martian Mono technical content, and an Anybody wordmark connect the two interfaces. The exact /mager/ profile is public; discovery and management need an invite. Agent access uses a separate scoped token.

**Key Characteristics:**
- A compact maker row keeps @handle identity in view.
- One selected project shows its screenshot, purpose, and source together.
- Real contribution evidence replaces decorative activity.
- Keyboard tabs, direct links, history, and no-JavaScript content all work.
- Local drafts, saves, follows, and public records remain distinct.

This records the approved November 4, 2026 software-browser correction. Source authority is the applied cascade in src/styles/sidework.css, studio.css, entry.css, composer.css, and agents.css, plus src/components/Studio.astro. The public implementation is src/components/Studio.astro, src/styles/studio.css, and src/scripts/studio.ts. PRODUCT.md and docs/sidework-surface.md record product scope and review. Fonts come from src/styles/fonts.css; images from docs/assets.json. This is a refinement of the existing world.

## Colors

The palette stays moss, lime, and pale text. Frontmatter values are normative. Dark is the default; an explicit light choice is stored under sidework-theme and applied before paint.

### Primary

Lime accent marks identity links, actions, focus, selected states, and saved states. Lime ink supplies text on filled accent controls.

### Secondary

Blue state identifies open contributions. Warm state identifies closed contributions and errors. Clay remains only in local story placeholders; the public prxps placeholder uses the shared surface, text, and lime colors.

### Neutral

Ground, surface, and raised moss tones separate content. Chalk is primary text; sage is secondary text and code. Moss borders define fields, file headers, screenshots, and evidence rows. Light tokens replace their dark counterparts without changing roles. Screenshots retain their source colors in both themes.

**The Source Color Rule.** Keep real software screenshots in their original colors. Do not tint them to match the interface.

## Typography

**Brand Font:** Anybody, with Arial Narrow and sans-serif fallbacks.
**Heading and Body Font:** Bricolage Grotesque, with Segoe UI and sans-serif fallbacks.
**Code Font:** Martian Mono, with a monospace fallback.

All use self-hosted Latin WOFF2 subsets and font-display swap. Anybody and Bricolage support weights 400–700 and widths 75–100%; Martian Mono supports weights 400–500 at 87.5% width. Body text uses automatic optical sizing and the body tracking token. The wordmark uses 82% width. Compact utility, entry, and story headings retain 90% width where the source specifies it.

### Hierarchy

- **Wordmark:** Anybody for brand use only. Public navigation uses 1.5rem, reduced to 1.375rem at 650px; entry pages retain 1.75rem and the workbench retains 1.5625rem.
- **Maker handle and project title:** compact Martian Mono identity at 1.5rem. Both reduce to 1.25rem on mobile; their line heights differ as recorded in the tokens.
- **Project tab:** mono name with a smaller Bricolage kind label. Mobile names use .75rem and kind labels .6875rem.
- **Project purpose and description:** Bricolage at 1.125rem and .875rem. Description line height is 1.7 with a maximum measure of 65ch.
- **Body and story caption:** workbench reading and local story purpose remain unchanged. Local story notes use body size with line height 1.8 and 65ch measure; taglines use 1.25rem and 45ch.
- **Code body and label:** commands, repository paths, stacks, counts, and evidence. Contribution repository lines use .6875rem, reduced to .625rem on mobile. Agent prompts retain their mono prompt role.
- **Workbench, entry, composer, and story titles:** existing compact Bricolage roles for each management task. Form text remains 1rem. The composer heading is 1.875rem at 700px and below.

**The Type Roles Rule.** Use Anybody for the wordmark, Bricolage Grotesque for headings and reading, and Martian Mono for code, source metadata, and public project names.

## Layout

The public header is sticky at the top with a ground fill, bottom border, and 12px by 28px padding. Main content and footer use a 1320px maximum width and 36px side padding. A 56px portrait, identity, and GitHub/Follow actions form the maker row. The latest real contribution appears directly below it; the linked title truncates on one line when needed.

The project browser is one bordered 6px container. Its horizontal switcher scrolls inside that container. Tabs are at least 64px high, with 14px by 20px padding. Each project has 24px padding. The selected workspace uses minmax(0, 1fr) and minmax(260px, .46fr) columns with a 28px gap. Images fit without cropping in a clamp(260px, 27vw, 380px) height. The details pane keeps purpose, description, stack, notes, repository, and build log together.

At 900px, main padding reduces to 24px, project padding to 20px, and the pane gap to 20px; the details column becomes minmax(220px, .65fr). The header Import projects action hides. At 650px, the header wraps into a wordmark and full-width navigation row, main padding becomes 16px, the portrait becomes 44px, and maker actions take their own row. Tabs have a 142px minimum width and remain horizontally scrollable. The selected workspace stacks image above details; images use a 1.5 aspect ratio with a 260px cap, and the prxps placeholder is 220px high. Project and contribution anchors account for the taller sticky header.

Contributions begin 32px below the browser, or 24px on mobile. Six rows use 14px vertical padding, a title/repository group, and explicit status. The footer follows content in normal flow; no bottom dock or reserved dock gap remains.

The workbench has a 1536px maximum width, a 204px rail, flexible main area, and 262px context panel. At 1180px side areas reduce to 180px and 225px. At 960px the context panel disappears and the rail becomes 175px. At 700px the shell becomes one flow with wrapping navigation. Main side padding is 32px, 42px from 1440px, 24px at intermediate widths, and 18px on mobile.

Editor, showcase, Agents, and Review hide the context panel. The editor splits form and preview equally above 960px, with a clamp(28px, 4vw, 64px) gap, reduced to 28px at 1180px. Its preview sticks 24px below the top, with internal scrolling capped at calc(100dvh - 48px). At 960px it follows the form without a height cap. Paired form fields stack at 1180px. Private showcase entries alternate 90% and 80% widths, become full width at 960px, and reduce vertical margins on mobile.

Entry content is at most 700px for invites and 920px for import, with 24px side margins; forms are at most 450px and 580px. At 650px import actions and footers wrap, and the import form button uses full width. Its bottom action bar remains sticky. Agents content is at most 960px wide. Commands and manual-copy text wrap or scroll inside their own surfaces.

## Elevation & Depth

Public software and portraits are straight, with no perspective, screenshot shadow, or decorative depth motion. Borders and surface tones separate the browser, tabs, images, and source information. Shadows remain only on the saved-project popover and status toast.

**The Still Software Rule.** Keep software previews straight and still. Use borders and surface tones for separation; reserve shadows for floating controls and feedback.

Tab selection changes the visible panel without an animation. Native cross-document view transitions remain, with named maker portrait and handle elements. Shared 160ms workbench button feedback remains. Reduced motion removes animations, transitions, and smooth scrolling. Management disclosures and local preview behavior are unchanged.

## Shapes

Use compact rectangles. The shared workbench panel radius is 4px. The public browser, portrait, saved popover, and toast use 6px corners; its images and header navigation items use 4px. Public Save and Follow use the shared 6px workbench controls. Entry and story fields retain 6px corners; local story media retain 8px corners and a 16:10 frame.

## Components

### Buttons and fields

Workbench buttons retain a 42px minimum height, 6px radius, and 9px by 13px padding. Primary actions use lime fill; secondary actions use a transparent fill and border. Hover raises the surface. Disabled actions use 0.6 opacity; disabled reorder controls use a default cursor. Public Save and Follow reuse the 42px minimum-height workbench button and explicit pressed states.

Story fields and token fields use 48px minimum height and 12px by 14px padding. Entry fields use 13px by 15px padding. Textareas resize vertically. Focus uses a 2px accent outline offset 4px; the search group uses a 2px offset. Native required, URL, and length constraints remain. Error text uses the warm color.

### Public navigation and project browser

The sticky header contains Explore, @mager, Saved with a count, and Workbench. Current and hover states use the raised surface. Links are at least 40px high on desktop and 44px on mobile. Import projects is a separate desktop action. The public profile and discovery share the browser; discovery adds a compact Explore builders heading and agent connection link.

The project switcher starts as real anchor links. JavaScript adds tablist, tab, and tabpanel semantics, selected state, and a roving tab stop. Arrow keys wrap through projects; Home and End select the first and last; Space activates a tab. Clicks update history and keyboard movement replaces the current hash. Direct project hashes, back/forward, and saved-project links select the correct panel. Saved links keep the current route. Selected tabs use accent text, ground fill, and a 2px accent underline; focus stays visible inside the tab border.

With JavaScript, one panel is visible. Without it, all four projects and six contribution rows remain available in the server-rendered page and the anchors still work. Each project has a mono name, maker byline, Save, and Open app. The screenshot fits without cropping and links to the app. The details pane exposes source and build-log links directly. There is no public README disclosure, manifest, long image sequence, or floating dock. The prxps placeholder uses its real name and purpose; no screenshot or activity is invented.

### Saved collection and feedback

Saved opens a native popover near the header, at 76px from the top and 28px from the right; mobile uses 110px from the top and 16px sides. It is at most 420px wide and 70dvh high, with 24px padding and 6px corners. The toast appears 24px above the bottom, with 14px by 20px padding and 6px corners. Saves and follows stay in this browser; status text explains local behavior and storage failure. Shared updates are not connected.

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
- **Do** keep the screenshot, purpose, stack, and source together in the selected project.
- **Do** retain real anchors, keyboard tabs, history, and the full no-JavaScript project list.
- **Do** keep the public software browser distinct from the private workbench.
- **Do** keep keyboard focus visible and support reduced motion.
- **Do** state that reviewed drafts save in this browser and do not publish.

### Don't:
- **Don't** use Anybody for content headings.
- **Don't** restore the public manifest, long project feed, floating dock, or marketing close.
- **Don't** add tilted screenshots, perspective drift, or a simulated terminal.
- **Don't** invent source records, people, activity counts, or learning outcomes.
- **Don't** claim that an agent can read local drafts or publish a profile.
