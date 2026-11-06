# Sidework: work list, project pages, and Settings

Routes: `/signup/` GitHub entry, `/waiting/` pending access and consent, `/invite/` legacy redirect, `/friends/` local follows, `/` discovery, `/mager/` maker profile, `/projects/cantalo/`, `/projects/homeport/`, `/projects/moodsh/`, `/projects/perch/`, and `/projects/prxps/` project details, `/settings/` preferences and workspace recovery, `/workbench/` browser-local planning tools, and `/onboarding/` public GitHub repository import. The exact `/mager/` profile, signup, exact OAuth start and callback routes, legacy invite redirect, and sign-out endpoint allow anonymous access. Waiting accounts can use the pending page and consent endpoint. Other website routes require approved account or valid legacy session access. The separate `/api/mcp` endpoint requires an origin-bound agent Bearer token; it does not accept a browser cookie as authentication. Version 2 account tokens recheck approval on each request. Unknown project slugs return 404 after the access gate.

The current direction uses a compact work list with equal space for personal projects and external contributions. Small thumbnails lead to open, full-width detail pages. This replaces the large browse screenshots and separate profile contribution section. The November 5 project-page and Settings update superseded the compact software browser and project tabs. The black and white interface, three fonts, real evidence, and separate private workbench remain.

THESIS: Give real software room to be seen. Follow a project link, learn its purpose, inspect its source, then open or save it.

OWN-WORLD: Black, white, and neutral gray keep attention on the work. Light, Dark, and System modes share the same layout; System is the default. Bricolage Grotesque carries headings and reading text; Martian Mono carries public project names, @handles, code, and source metadata; Anybody marks the brand. Real screenshots retain their colors and remain straight. Space and type separate project content without card borders or panel frames.

STORY: The profile and Explore alternate five real projects with six authored external contribution stories, starting with Cántalo and Uber Direct SDK. Both use the same rows. Normal links open separate detail pages, which require approved account or valid legacy session access. Project details retain their full screenshots, purpose, source metadata, and app/save actions. Settings holds theme controls, workspace reset and restore, email consent, and sign-out. Personal planning and raw PR history remain in the private workbench. Selected evidence remains on contribution detail pages.

FIRST VIEWPORT: Shared sticky navigation and a compact maker row lead to All work, Projects, and Contributions links. These use normal GET requests and work without JavaScript. Categories appear only under Projects; existing category-only URLs still work. The list has two columns on desktop and one at 760px and below. Project thumbnails use 96 × 64px on desktop and 64 × 48px on mobile, with their original colors. Contribution icons use the same space. Both row types use the same title size and short text. Full screenshots appear only on detail pages. Add a contribution opens the existing private editor. Repositories owned by the story author are excluded from the contribution feed.

FORM: Code-led update using the existing palette, source assets, and three-font system. The current source is the visual authority. No generated comp defines this update. Project browsing uses Experience mode; Settings uses Operate mode. The private workbench keeps its existing editing and showcase layouts.

SIGNATURE: Compact, borderless rows give projects and external contributions equal space. Small source-color thumbnails lead to full-width detail pages. Detail titles still scale to 4.5rem. Settings is the single location for theme controls.

Historical work-list validation: The work-list update passed its scoped finish review with no material defects. All 62 tests and the production build passed; the layout detector returned no findings. Review captures are `.impeccable/review/work-feed-mobile.jpg`, `work-feed-desktop.jpg`, `work-feed-320.jpg`, `work-feed-light.jpg`, `work-feed-contributions.jpg`, `work-feed-detail.jpg`, and `work-feed-explore.jpg`. HTTP checks confirmed 11 All work entries, six Contributions, five Projects, and one result for the existing Learning category URL. Anonymous project detail, contribution detail, and draft routes still redirect to the invite gate. These checks describe local validation.

Historical mobile correction: The earlier narrow-layout review passed with 58 tests, a production build, and no layout findings. Captures are `.impeccable/review/mobile-content-390.jpg`, `mobile-content-320.jpg`, `mobile-content-424.jpg`, and `mobile-content-desktop.jpg`. Its large browse images and project-only list are superseded by the work list.

Historical project-page and Settings validation: Seven review images cover desktop and mobile project indexes, project detail, and Settings: `.impeccable/review/projects-desktop.png`, `projects-user.png`, `projects-mobile-light.png`, `project-detail-desktop.png`, `project-detail-mobile.png`, `settings-mobile.png`, and `settings-desktop-light.png`. The final Settings capture is `.impeccable/review/settings-ready.png`. At that stage, 50 tests and the production build passed. HTTP checks confirmed that detail and Settings routes require invite access, authenticated requests return 200, missing projects return 404, and the exact public profile returns 200. Normal project links work without JavaScript. Reset tests cover success and backup failure. These checks do not claim a new deployment.

## GitHub waitlist update — November 6, 2026

Mode: Operate. Sign in with GitHub, store verified identity and optional email update consent, then wait for access. New accounts receive `waiting` status; only the configured owner starts approved. No email delivery is connected. Do not approve other accounts until private exports, draft review, and MCP templates support their identity. These still use @mager, and public multi-profile publishing is not connected.

The shared fonts, monochrome palette, and Built with Astra footer remain. Source for these pages is `AccountLayout.astro`, `signup.astro`, `waiting.astro`, and `account.css`. GitHub OAuth and Firestore are configured. The local validation record has 75 passing tests and a production build. Real GitHub sign-in verified owner @mager (ID 17733). A temporary waiting status verified Workbench and Settings redirects, saved unchecked consent, sign-out, and repeat sign-in that retained waiting status. Approval was then restored and Friends was checked.

Signup and waiting pages were captured at 390 × 844 and 1280 × 900 in `.impeccable/review/github-signup-ready-mobile.jpg`, `github-signup-ready-desktop.jpg`, `github-waiting-mobile.jpg`, and `github-waiting-desktop.jpg`. The earlier unavailable-state captures remain historical evidence. Production deployment, production OAuth, and the cancellation check remain pending. See [github-auth.md](github-auth.md) for setup and access checks. Earlier validation below applies only to its recorded scope.

## Content and provenance

- Cántalo content comes from its live MATADORA page and private `mager/cantalo` README, checked November 5, 2026. Other project descriptions and links come from magerblog. Homeport, Mood Shell, and Perch screenshots come from those posts; Cántalo and prxps use real captures made November 5, 2026. Origins and permission notes are in `docs/assets.json`. Screenshots are previews, not embedded live app sessions.
- Six recent PR records were read from GitHub on November 4, 2026; older records retain their prior dates.
- The portrait is the existing @hopperdraws illustration for @mager.
- The prototype starts with one real maker. Do not invent people, reactions, followers, ratings, or messages.
- Saved projects, draft edits, and plans stay in localStorage. Public profile data is committed source content.

## GitHub entry and import extension

The entry pages use the shared neutral palette and existing type system. Compact Bricolage Grotesque carries the openings. Anybody is reserved for the wordmark. Bricolage Grotesque gives reading text a more distinctive character, with automatic optical sizing and light tracking. Martian Mono stays limited to source metadata. Every main footer carries “Built with Astra”.

GitHub signup replaces the invite-code form. It uses a centered, borderless column with one GitHub action and optional email consent. Missing configuration disables the action and shows an unavailable message. The waiting page shows the verified @handle, pending access, a public profile link, email preference, and sign-out. The import flow is left aligned and wider: a handle form, loading status, search and source filters, unboxed checkbox rows, and a sticky selection action. On mobile the import controls wrap and the primary form action takes full width. These focused flows support the studio without changing it into a dashboard.

GitHub results include owned public forks and archived repositories unless filtered out. Select matching includes results beyond the visible rows. Imports exclude existing projects and save selected repositories as drafts in this browser. Import does not publish or change the account record. Sign out removes browser access cookies but keeps local drafts. GitHub account workspaces use numeric ID storage keys. Existing legacy data is retained without automatic migration; the theme remains browser-global.

## Story editor and profile draft extension

The workbench keeps its compact controls while the local preview uses studio type. On desktop, the form and sticky preview share the available space; the context panel is hidden. At 960px and below, the preview follows the form. At 700px and below, the shell uses one content column. Profile drafts alternate wide and narrower project blocks on desktop and use full width on smaller screens. This uneven private showcase remains a workbench pattern; the project index and separate detail pages use the current layout above.

Story fields cover the project purpose, stage, stack, optional HTTPS screenshot and description, source, reason for building, and lessons learned. Native disclosures keep optional details compact. Saving creates a local draft or a local override of a seeded project. Failed saves retain the form text and last saved state. The public profile stays unchanged.

Up to six projects can be featured and reordered with named earlier/later controls. Focus remains within the active panel after these controls update the view. The private JSON export includes selected stories in order and the prototype handle @mager. Review a draft file can restore this format after explicit review and save; it does not publish. GitHub imports preserve story fields and profile order.

Review passed at desktop 1440px and mobile 390px with no horizontal overflow. Evidence: .impeccable/review/editor-desktop.png, editor-mobile.png, showcase-desktop.png, and showcase-mobile.png. The recorded composer detector findings are empty.

## Agents and draft review extension

Agent mode is Operate: read evidence, prepare stories, then return the author to review. Workbench → Agents presents three numbered steps for a scoped token, Claude Code or generic MCP setup, and a direct review link. A labeled password field holds the token in page memory. If copying is blocked, a readonly text area shows the exact requested token, configuration, or install commands, takes focus, and selects the text. Hide text clears that value and returns focus to a copy control. Tokens and token-bearing configuration remain private.

Agents and Review reuse the workbench shell with its context panel hidden, existing rail breakpoints, and single-column mobile layout at 700px. The Agents content is at most 960px wide. The panel uses shared neutral surfaces and actions, compact Bricolage Grotesque headings and reading text, and Martian Mono commands. Token inputs reuse the 48px minimum height, 6px radius, and 12px by 14px padding of story fields. Setup code wraps; controls wrap on small screens. Review reuses the unboxed project preview, marks additions or replacements, and offers Save these projects or Cancel.

The endpoint supplies six tools, one profile resource, and one setup prompt. The Claude Code plugin adds setup-profile and find-contribution skills without shell hooks or background jobs. Tokens last at most 24 hours and allow catalog reading, public GitHub reading, and draft preparation. The only profile is @mager. Agents cannot save browser state or publish. Review links carry compressed fragments, removed before display; there is no server inbox. JSON draft files provide the same review flow. The user’s explicit save merges matching local stories and the featured order while keeping other projects and the weekly plan. See [agents.md](agents.md) for the exact capabilities and limits.

The agent extension reused the workbench system. The later approved source-first refinement updates the shared type record, including the 1.0625rem purpose-text role.

Review evidence: .impeccable/review/agents-desktop.png, agents-mobile.png, agent-review-desktop.png, and agent-review-mobile.png. The reviewer accepted the desktop and mobile flows after the manual-copy fix. Source and DOM checks cover failed copying, exact fallback text, focus/selection, and clearing. Protocol validation found six tools, one resource, and one prompt; the live GitHub check returned 88 public repositories. Direct-link review, save/reload, and JSON-file restore were verified. These are dated validation results, not interface counts or product limits.

## Earlier source-first refinement — November 4, 2026

The compact three-font system, straight screenshots, and visible source evidence remain. Its manifest, uneven public sequence, and bottom dock are superseded by the software browser below.

## Software browser correction — November 4, 2026 (superseded)

User feedback: the result still feels like a blog. Replace the long public project sequence with a compact software browser while preserving fonts, colors, @handles, real content, and the separate workbench. The public mode is now Operate: choose a maker, switch among projects, open an app/source, save it, and inspect contribution evidence. First viewport: sticky navigation, compact maker row, latest dated contribution, horizontal project tabs, and one selected project with a real screenshot and purpose/source panel. Remove the manifest, giant intro, repeated screenshots, floating dock, and closing marketing section. The tabs support keyboard navigation, direct links, and history; without JavaScript all projects remain visible. Mobile scrolls the tab strip and stacks only the selected project. No social activity is invented; saves/follows remain local. Finish: ship at the reviewed scope. The fresh reviewer compared the rejected structure with profile and Explore at desktop and mobile sizes, plus the light prxps view. No material visual blocker remained. DESIGN.md and its schema-v2 sidecar now record the browser layout and current public controls.

November 4 review evidence: .impeccable/review/browser-desktop.png, browser-mobile.png, browser-explore-desktop.png, browser-explore-mobile.png, and browser-light.png. Real-browser checks covered keyboard and click switching, direct/saved links, history, and popovers. Server-rendered output contains all four projects and six contributions. Layout detector findings were empty before and after the correction; 40 tests and the production build passed. Saves and follows remain local, with no social backend.

## Black and white theme update — November 5, 2026 (palette retained; control locations superseded)

The user selected a completely black and white interface with minimal controls that keep attention on the work. Black, white, and neutral gray now apply to surfaces, actions, focus, placeholders, and status. Project screenshots keep their original colors. Explicit draft, merged, open, and closed labels remain. The compact browser layout and three fonts are unchanged.

A native theme selector offers Light, Dark, and System. System is the default and follows operating-system changes. Saved choices apply before paint and changes in another tab update the current tab. Without JavaScript, CSS follows the system preference. The selector appears in public and workbench headers and invite/import footers.

DESIGN.md and .impeccable/design.json record the implemented palette and theme control. Prior review images and test counts above remain historical evidence; they do not validate this update.

Validation on November 5: 44 tests, the production build, and diff checks passed. Browser checks covered Light, Dark, and System, saved choices, device changes, the no-JavaScript fallback, and layouts from 320px to 1440px with no page overflow. The final design review returned ship for this theme change. Evidence is in .impeccable/review/mono-*.png; mono-agents-final.png is the final Agents capture.

## Friends and fresh workspace extension — November 5, 2026 (entry flow and reset location superseded)

Mode: Operate. The user asked for Friends after invite access and a return to the state just after entry. A direct invite visit or a return path of `/` now opens Friends. Other explicit return paths remain. Friends requires the same signed invite cookie as the workbench.

The first view has a welcome row with Add your first project, an empty Friends list, and the real @mager profile as a follow option. Following moves that profile into the list. View work and Unfollow stay beside it. The same local follow preference is used on the public profile. There are no invented people, friend requests, remote follows, or new accounts.

Friends preserves the approved monochrome palette, three fonts, shared buttons, theme selector, and Built with Astra footer. The content is at most 1040px wide, with border-separated rows. At 760px and below, navigation wraps below the wordmark and theme selector; the welcome and profile rows stack. Workspace settings is a native disclosure below the main content.

Reset my workspace first saves one local restore copy, then clears drafts, featured order, the weekly plan, saves, and follows. The invite cookie and theme stay in place. Restore previous workspace uses that copy; each later reset replaces it. Fresh and reset workspaces start with zero projects and profile selections. Older version 1 workspaces without `includeExamples` retain their examples. The workbench title is Your workbench. Public @mager contribution evidence stays separate and is labeled as such. Import permits public snapshot repositories when they are absent from the local workspace.

Validation: 50 tests, the production build, and diff checks passed. Browser checks verified reset, follow/unfollow, an empty project list and featured selection after reload, and the available restore control. HTTP checks confirmed the Friends invite gate, the post-invite Friends redirect, and rejection of cross-origin invite submissions. Desktop, mobile, narrow mobile, and Light mode review returned ship for this extension. Evidence: .impeccable/review/friends-*.png and fresh-workbench-*.png.

## Project pages and Settings — November 5, 2026 (browse layout superseded)

The user approved removal of project tabs, separate full-width project pages, and no content borders or panel frames. Real screenshots keep their colors. The exact /mager/ profile remains public; project detail routes and Settings keep the invite gate. The shared project layout keeps navigation, Saved, the Built with Astra footer, and a Settings link on the right. Four project previews use two columns above 760px and one below. Detail screenshots use their natural ratio. Description and source metadata use two columns on desktop and one on mobile. prxps has no fake screenshot.

All theme controls moved to Settings → Appearance. The public header, workbench header, Friends, and import flow link to Settings. The invite footer no longer has a theme selector. Workspace reset and restore moved from Friends to Settings. They keep the same single local restore copy, preserve theme and invite access, and open Friends after success. Invite access provides Lock Sidework. The private story editor, profile draft, and agent-review behavior remain as documented above.

The current review evidence and validation are recorded in FINISH. Earlier review sections describe their original scope; their tab layout, browse screenshots, and theme/reset locations are not current guidance. DESIGN.md and its schema-v2 sidecar record the implemented project pages and Settings.

## Contribution showcase extension (profile layout superseded)

This extension added six authored contribution stories, separate source-detail pages, and a private local editor. See `.impeccable/surfaces/contributions.md`. The layout uses short text and borderless rows. The real prxps screenshot is `public/images/prxps-games.jpg`, with provenance in `docs/assets.json`.

Validation: 58 tests and the production build passed. Desktop, 390px mobile, and the 424px user viewport were checked; Light and Dark modes were inspected. The finish review scored all five code and design corrections resolved. Anonymous contribution routes redirect to the invite gate; the exact public profile remains available. This records local validation, not deployment.
