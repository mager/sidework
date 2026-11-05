# Sidework: an open studio

Routes: `/invite/` access gate, `/` discovery, `/mager/` maker profile, `/workbench/` browser-local planning tools, and `/onboarding/` public GitHub repository import. The exact `/mager/` profile and the invite page allow anonymous access. Other website routes require a valid invite session. The separate `/api/mcp` endpoint requires an origin-bound agent Bearer token; it does not accept an invite cookie as authentication. The maker profile can be shared without an invite.

The current correction replaces the former open-studio page composition with a compact software browser. It preserves the shared identity, real evidence, and separate private workbench. The earlier no-columns and uneven public sequence direction is superseded by the approved selected-project workspace.

THESIS: Inspect real software and the person behind it. Choose a project, see its purpose and source, then open or save it.

OWN-WORLD: Near-black moss ground and lime identity. Compact Bricolage Grotesque headings and reading text; Martian Mono public project names, profile handle, code, and source metadata; Anybody wordmark only. Use @handles for people. Real screenshots retain their colors and stay straight. Containers identify code, software previews, and tools.

STORY: Enter with an invite code. Open a project preview, learn what it does, visit it or its source, save it locally, and find its maker. Upstream work is part of the maker's record. Personal planning lives in the workbench. A GitHub handle can supply public repositories for bulk import as local project drafts. The import does not verify account ownership or publish a profile.

FIRST VIEWPORT: Sticky navigation, compact maker row, latest actual contribution, and horizontal project tabs. One selected workspace places the screenshot beside purpose and source details. Mobile scrolls the tab strip and stacks that workspace.

FORM: Code-led software browser using the existing moss/lime and three-font system. The compact selected-project workspace supersedes the earlier open-studio composition. The workbench keeps its existing form and private showcase layouts. No generated comp defines this correction.

SIGNATURE: Progressive project tabs combine keyboard operation, real anchors, direct links, and history. One selected software workspace replaces the former long studio sequence. Contribution evidence stays compact; all four projects remain visible without JavaScript.

FINISH: The studio, invite/import/type extension, story editor/profile-draft extension, and agent/review extension passed review. The agent extension reached ship after the clipboard-failure path gained an exact, labeled manual-copy fallback. The story extension reached ship after keyboard focus was retained through feature and reorder changes. The preview is deployed at https://sidework-ten.vercel.app; the requested hostname was unavailable. Access uses reusable invite codes and seven-day sessions. Individual accounts, remote follows, and public posting remain unconnected. The design records preserve the studio world and document the implemented entry flow.

## Content and provenance

- Personal software and screenshot URLs come from magerblog project posts. Screenshots are historical previews, not embedded live app sessions.
- Six recent PR records were read from GitHub on November 4, 2026; older records retain their prior dates.
- The portrait is the existing @hopperdraws illustration for @mager.
- The prototype starts with one real maker. Do not invent people, reactions, followers, ratings, or messages.
- Saved projects, draft edits, and plans stay in localStorage. Public profile data is committed source content.

## Invite and import extension

The entry pages retain the moss, lime, and open type system. Compact Bricolage Grotesque carries the openings. Anybody is reserved for the wordmark. Bricolage Grotesque gives reading text a more distinctive character, with automatic optical sizing and light tracking. Martian Mono stays limited to source metadata. Every main footer carries “Built with Astra”.

The invite form is centered, with one code field and a contact link to @mager. The import flow is left aligned and wider: a handle form, loading status, search and source filters, unboxed checkbox rows, and a sticky selection action. On mobile the import controls wrap and the primary form action takes full width. These focused flows support the studio without changing it into a dashboard.

GitHub results include owned public forks and archived repositories unless filtered out. Select matching includes results beyond the visible rows. Imports exclude existing projects and save selected repositories as drafts in this browser. No public publishing or shared account record is implied. Lock Sidework removes access but keeps browser-local drafts.

## Story editor and profile draft extension

The workbench keeps its compact controls while the local preview uses studio type. On desktop, the form and sticky preview share the available space; the context panel is hidden. At 960px and below, the preview follows the form. At 700px and below, the shell uses one content column. Profile drafts alternate wide and narrower project blocks on desktop and use full width on smaller screens. This uneven private showcase remains a workbench pattern; the public browser now shows one selected workspace.

Story fields cover the project purpose, stage, stack, optional HTTPS screenshot and description, source, reason for building, and lessons learned. Native disclosures keep optional details compact. Saving creates a local draft or a local override of a seeded project. Failed saves retain the form text and last saved state. The public profile stays unchanged.

Up to six projects can be featured and reordered with named earlier/later controls. Focus remains within the active panel after these controls update the view. The private JSON export includes selected stories in order and the prototype handle @mager. Review a draft file can restore this format after explicit review and save; it does not publish. GitHub imports preserve story fields and profile order.

Review passed at desktop 1440px and mobile 390px with no horizontal overflow. Evidence: .impeccable/review/editor-desktop.png, editor-mobile.png, showcase-desktop.png, and showcase-mobile.png. The recorded composer detector findings are empty.

## Agents and draft review extension

Agent mode is Operate: read evidence, prepare stories, then return the author to review. Workbench → Agents presents three numbered steps for a scoped token, Claude Code or generic MCP setup, and a direct review link. A labeled password field holds the token in page memory. If copying is blocked, a readonly text area shows the exact requested token, configuration, or install commands, takes focus, and selects the text. Hide text clears that value and returns focus to a copy control. Tokens and token-bearing configuration remain private.

Agents and Review reuse the workbench shell with its context panel hidden, existing rail breakpoints, and single-column mobile layout at 700px. The Agents content is at most 960px wide. The panel uses existing moss surfaces, lime actions, compact Bricolage Grotesque headings and reading text, and Martian Mono commands. Token inputs reuse the 48px minimum height, 6px radius, and 12px by 14px padding of story fields. Setup code wraps; controls wrap on small screens. Review reuses the unboxed project preview, marks additions or replacements, and offers Save these projects or Cancel.

The endpoint supplies six tools, one profile resource, and one setup prompt. The Claude Code plugin adds setup-profile and find-contribution skills without shell hooks or background jobs. Tokens last at most 24 hours and allow catalog reading, public GitHub reading, and draft preparation. The only profile is @mager. Agents cannot save browser state or publish. Review links carry compressed fragments, removed before display; there is no server inbox. JSON draft files provide the same review flow. The user’s explicit save merges matching local stories and the featured order while keeping other projects and the weekly plan. See [agents.md](agents.md) for the exact capabilities and limits.

The agent extension reused the workbench system. The later approved source-first refinement updates the shared type record, including the 1.0625rem purpose-text role.

Review evidence: .impeccable/review/agents-desktop.png, agents-mobile.png, agent-review-desktop.png, and agent-review-mobile.png. The reviewer accepted the desktop and mobile flows after the manual-copy fix. Source and DOM checks cover failed copying, exact fallback text, focus/selection, and clearing. Protocol validation found six tools, one resource, and one prompt; the live GitHub check returned 88 public repositories. Direct-link review, save/reload, and JSON-file restore were verified. These are dated validation results, not interface counts or product limits.

## Earlier source-first refinement — November 4, 2026

The compact three-font system, straight screenshots, and visible source evidence remain. Its manifest, uneven public sequence, and bottom dock are superseded by the software browser below.

## Software browser correction — November 4, 2026

User feedback: the result still feels like a blog. Replace the long public project sequence with a compact software browser while preserving fonts, colors, @handles, real content, and the separate workbench. The public mode is now Operate: choose a maker, switch among projects, open an app/source, save it, and inspect contribution evidence. First viewport: sticky navigation, compact maker row, latest dated contribution, horizontal project tabs, and one selected project with a real screenshot and purpose/source panel. Remove the manifest, giant intro, repeated screenshots, floating dock, and closing marketing section. The tabs support keyboard navigation, direct links, and history; without JavaScript all projects remain visible. Mobile scrolls the tab strip and stacks only the selected project. No social activity is invented; saves/follows remain local. Finish: ship at the reviewed scope. The fresh reviewer compared the rejected structure with profile and Explore at desktop and mobile sizes, plus the light prxps view. No material visual blocker remained. DESIGN.md and its schema-v2 sidecar now record the browser layout and current public controls.

Current evidence: .impeccable/review/browser-desktop.png, browser-mobile.png, browser-explore-desktop.png, browser-explore-mobile.png, and browser-light.png. Real-browser checks covered keyboard and click switching, direct/saved links, history, and popovers. Server-rendered output contains all four projects and six contributions. Layout detector findings were empty before and after the correction; 40 tests and the production build passed. Saves and follows remain local, with no social backend.
