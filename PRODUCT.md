# Sidework

## Users and purpose

Developers who make personal software and contribute to other projects. They need a shareable record that explains what their work does, plus a practical place to discover and plan useful contributions.

## Positioning

A gallery of personal software and external contributions: help visitors understand the work and inspect its source. Clear descriptions and useful classification come before social activity.

A social space for builders, nerds, coders, and vibers to discover personal software and meet its makers. Project ownership and upstream contributions belong in one story but retain distinct attribution. GitHub supplies evidence; authored descriptions supply meaning.

## Operating context

The exact `/mager/` profile route stays public. `/signup/` starts GitHub OAuth with optional email update consent. The callback records a verified GitHub numeric ID, login, verified email, and access status in Firestore. New accounts wait at `/waiting/`; they can change consent but cannot enter the tools. Only the configured owner starts approved and opens Friends. Account sessions last seven days. Sign out clears account and legacy access cookies. `/invite/` redirects to signup and no longer accepts codes. Existing legacy cookies and agent tokens remain valid until expiry or hash revocation. See [GitHub auth setup](docs/github-auth.md) for exact route and credential rules.

The prototype has one source-backed maker profile, @mager, and browser-local workbench state. Public GitHub data can be read without sign-in or account permissions. The account service stores identity, access status, and consent only; no shared draft or social service is connected. GitHub OAuth and Firestore are live. Local and production checks covered owner access, waiting access, consent changes, sign-out, and repeat sign-in. A production HTTP callback check covered cancellation with valid OAuth state. Email delivery is not connected. Do not approve other accounts yet: private exports, draft review, and MCP templates still use @mager. Public multi-profile publishing is not connected. Local saves, follows, plans, and imported drafts use GitHub numeric ID storage keys. They are not shared between browsers or published. Legacy data stays in its original keys without automatic migration. Theme stays browser-global.

The deployed preview is https://sidework-ten.vercel.app. The originally requested hostname was unavailable.

## Owner admin

The separate [admin site](https://sidework-admin.vercel.app) gives the configured owner a read-only view of signup records. Settings has an owner-only Open admin link. The dashboard shows @handles, email addresses, access status, update consent, signup dates, and last sign-in dates. Search and status/consent filters work on the latest 1,000 records; a notice appears if more records are available. Dates use America/Chicago. Search uses POST so email queries stay out of URLs.

The site does not approve accounts, delete records, change consent, or send email. It checks the current approved owner account by GitHub numeric ID on every private request. Its separate session comes from a one-time PKCE handoff through the main `/admin/connect/` route. Main-site account cookies, legacy invite cookies, and agent tokens do not grant admin access. Both Vercel projects deploy from this repository on `main`. See [admin setup](docs/admin.md).

## Friends and Settings

Friends lists builders followed in this browser. The only available profile is @mager. An empty list explains how to follow a builder; a followed profile provides View work and Unfollow controls. Friends and the public profile use the same local follow preference. There are no mutual friend requests or remote follows.

Settings → Workspace → Reset my workspace clears local project and contribution drafts, featured order, the weekly plan, saved projects, and follows. It keeps the access cookie and theme choice. The reset first stores one local restore copy under `sidework-reset-backup-v1` (with `:github:<numeric-id>` for accounts); Restore previous workspace restores that copy. A later reset replaces the copy. This is recovery in the same browser and origin, not a downloaded backup or public publishing. A successful reset or restore opens Friends. Settings also holds Appearance with Light, Dark, and System choices, Email updates for signed-in accounts, and Preview access with Sign out. Theme controls appear only in Settings.

The workbench is titled Your workbench. A fresh or reset workspace has no local projects or profile selections. Its overview links to import, story creation, and Friends. Public @mager contribution evidence remains available and is labeled separately from local work.

## Repository import

After entering the site, people can open /onboarding/, supply a GitHub handle, and read all pages of that handle’s public owned repositories. Forks and archived repositories are included by default and can be filtered out. People can search, select matching results in bulk, clear the selection, or choose individual repositories. Projects already in the workbench are excluded from duplicate imports. A fresh workbench can import repositories that also appear in the public snapshot.

Selected repositories become drafts in the current browser’s workbench. Imports preserve repository links, descriptions, and primary language; a safe repository homepage becomes the project link when present. The importer keeps existing project stories, contribution drafts, profile-draft order, and plans. It supports up to 5,000 local project drafts, subject to browser storage limits. GitHub request limits, missing handles, cancellation, and storage failures are reported. Publishing and private repositories are not connected. GitHub sign-in verifies account identity; importing a public repository does not verify authorship or ownership of that work.

## Project stories and profile draft

The workbench can create and edit local project stories. Each story can include a short tagline, description, stage, stack, HTTPS screenshot with descriptive text, source link, reason for building, and lessons learned. A live preview shows the story while it is edited. Edits to seeded projects are local overrides and do not change the public @mager snapshot. Save failures retain unsaved form text and the last saved draft.

People can feature up to six projects, change their order with labeled earlier/later buttons, and inspect an asymmetric private profile draft. Fresh workspaces start with no projects or featured selections. Existing version 1 workspaces without an `includeExamples` field retain the seeded projects. Feature changes and order stay in this browser. Bulk GitHub imports preserve this order and existing story fields.

Export draft downloads a private JSON copy of only the selected projects and stories in order. Its prototype handle remains @mager. It excludes unselected projects, contribution drafts, and plans. Profile draft → Review a draft file can restore a valid version 1 export after review and an explicit save. Public publishing and account-specific profiles remain unconnected.

## Contribution stories

Six authored @mager stories from the software page explain upstream work. The public `/mager/` profile and Explore alternate them with five personal projects in one list, starting with Cántalo and Uber Direct SDK. Projects and contributions use the same row layout and visual weight. Stories about repositories owned by their author are excluded from the contribution list. Raw PR history is available in the workbench, not on the profile. The separate contribution index, detail pages, and draft editor require approved account or valid legacy session access. Detail pages show selected PR or commit evidence with source links, check dates, and explicit PR states. This selection does not claim a complete history or prove every statement in the authored story.

People can create and edit up to 20 private contribution drafts in this browser. Each has a project name, @handle, upstream repository, story, and a GitHub PR, issue, or commit URL for that repository. The editor validates the URL format and repository match; it does not verify the handle or source claims. A live preview shows the draft. Project imports, draft review, and workbench saves preserve contribution drafts. Workspace reset and restore include them. Add a contribution opens this private editor. Contribution publishing, export, and agent preparation are not connected.

## Agent setup and draft review

The agent mode is Operate: an agent reads source evidence and prepares a draft for the user to review. The user can ask, “Set up my Sidework profile from my GitHub projects.” Sidework provides its own Streamable HTTP MCP endpoint and a Claude Code plugin distributed from this repository. [docs/agents.md](docs/agents.md) is the capability and setup reference.

The MCP has six tools: read the profile, search published projects, read dated contributions, discover curated opportunities, page through public GitHub repositories, and prepare one to six projects in featured order. It also has one profile resource and one setup prompt. The plugin supplies setup-profile and find-contribution skills. Agents must use source evidence and the author’s input for project stories. They cannot read browser-local drafts, save a profile, publish, delete, send messages, or change GitHub. Exported drafts can supply the author’s latest local edits.

Workbench → Agents issues a token with catalog:read, github:public, and draft:prepare scopes. It expires within 24 hours or when its source session expires, whichever is first. It is bound to the endpoint origin and grants no website access. Version 2 tokens identify an approved GitHub account and recheck database approval on each request. Legacy version 1 invite tokens remain supported. The page keeps the token in memory, not localStorage. The profile resource and draft templates still support @mager only. Private GitHub access is not connected.

Prepared drafts return a review link and JSON data. The link carries compressed draft data in its fragment, not a server inbox. Sidework removes the fragment before showing the review. The original link is not encrypted and may remain in the agent conversation, browser history, or clipboard tools. Long drafts use a JSON file; Review a draft file accepts the same format up to 64 KB.

The review shows which projects will be added or replace local stories. Nothing is saved until the user chooses Save these projects. A successful save updates matching IDs or source URLs and sets the featured order. Other projects and the weekly plan remain. Invalid drafts and failed writes leave saved state unchanged. A pending review is held in memory and is lost on reload; the user can reopen its link or file. No agent or review action changes the committed public profile.

## Evidence on hand

Five personal projects, including Cántalo from its live site and repository and four projects from magerblog, six authored contribution stories checked November 5, 2026, six recent PR states checked November 4, 2026, selected older PR evidence from October 12, and four dated contribution opportunities.

## Product principles

- Show what software does before activity counts.
- Link contribution claims to evidence and preserve status dates.
- Make discovery useful for a stated learning goal.
- Keep drafts, local plans, and published records distinct.
- Value small useful tools and upstream fixes without artificial rankings.

## Priority

The user selected a shareable developer profile and a personal projects/contributions workbench as the first priorities. The working name Sidework was explicitly selected.

## Confirmed visual direction

The shared identity uses self-hosted Bricolage Grotesque headings and body text, Martian Mono handles, project names and source metadata, and an Anybody wordmark. The user selected a minimal black and white interface so that the work stays in focus. Black, white, and neutral gray apply to controls, surfaces, focus, and status. Project screenshots retain their original colors. Light, Dark, and System modes are available, with System as the default. The existing layout, fonts, and “Built with Astra” footer remain.

Project browsing uses Experience mode. The profile and Explore show one compact work list, with two columns on desktop and one column on mobile. All work, Projects, and Contributions use normal GET links. Project categories appear only in Projects; existing category URLs still select that view. Project thumbnails are 96 × 64px on desktop and 64 × 48px on mobile. Contribution icons use the same space. Full screenshots appear only on detail pages. Normal links open separate, full-width project detail pages. Content has no card borders or panel frames. Real screenshots keep their original colors and natural ratio on detail pages. The prxps entry uses a real test-account screenshot captured with owner permission on November 5, 2026. Each detail page uses a compact 1.5rem–2rem title, 1.125rem tagline, and 1rem body. The screenshot and story share a row with a 48px gap on desktop. At 1000px and below, the image sits above a two-column story; at 760px and below, the story uses one column and the tagline uses 1rem. The image keeps its source size limit and 60svh height cap. Technology tags are text, and captions retain authored context without repeating alt text. Pages show purpose, description, source metadata, app and save actions, and More by @mager links. These detail routes require approved account or valid legacy session access; the exact /mager/ profile remains public.

Contribution browsing uses the same open, monochrome layout. Short story rows link to separate detail pages. The editor places its form beside a private preview on desktop and above it on mobile. Copy stays brief; source details belong with the evidence.

Settings uses Operate mode. It holds all theme controls, workspace reset and restore, email consent, and sign-out. Headers link to Settings. The private workbench retains its editing, showcase, import, and agent-review flows. This November 5, 2026 direction supersedes the compact software browser and project tabs.


## Project metadata, first version

Each project can have one category, one software type, a short intended audience, and up to five concrete features. The description explains the task and how the software works; the tagline names the main action. Categories describe purpose (Developer tools, Productivity, Creative tools, Learning, Games & recreation, Utilities). Software types describe delivery (Web app, Command-line tool, Desktop app, Mobile app, Browser extension, Library, API / service). Programming languages remain in the existing stack field.

The shared vocabulary lives in `src/scripts/project-metadata.mjs`. Missing metadata is allowed, including in older version 1 drafts. GitHub imports provide repository facts and leave classification, audience, and features blank for author review. Imports preserve existing authored metadata. The editor, preview, JSON backups, draft review, and MCP use the same fields and limits. Agents can prepare them from evidence but cannot publish. The Projects view has category links that work without JavaScript; project pages show the audience and features. Add categories only when real projects need them; nested categories, rankings, and automatic classification are outside this first version.

## Latest project: Cántalo

Cántalo is first in the public project gallery. It pairs Spotify listening with original Spanish practice phrases and a personal dictionary. Its real MATADORA screenshot retains the bright source colors. The project detail links to the requested song, project story, and private `mager/cantalo` repository. Adding it to the public snapshot does not change browser-local drafts or their selected order.
