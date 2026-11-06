# Sidework

## Users and purpose

Developers who make personal software and contribute to other projects. They need a shareable record that explains what their work does, plus a practical place to discover and plan useful contributions.

## Positioning

A personal software gallery: help visitors understand what a project does and decide whether to try it. Clear descriptions and useful classification come before social activity.

A social space for builders, nerds, coders, and vibers to discover personal software and meet its makers. Project ownership and upstream contributions belong in one story but retain distinct attribution. GitHub supplies evidence; authored descriptions supply meaning.

## Operating context

The exact `/mager/` profile route is public and can be shared without an invite. Friends, discovery, project detail, all contribution routes, Settings, workbench, and import routes require a valid invite session. The invite page is their entry point. Reusable invite codes grant seven days of access. They do not create individual accounts or verify a GitHub identity. Lock Sidework clears the access session. A direct invite visit or a return path of `/` opens `/friends/` after access is granted. Other explicit return paths are preserved.

The prototype has one source-backed maker profile, @mager, and browser-local workbench state. Public GitHub data can be read without sign-in or account permissions. No multi-user or social service is connected. Local saves, follows, plans, and imported drafts are not shared between browsers or published to a profile.

The deployed preview is https://sidework-ten.vercel.app. The originally requested hostname was unavailable.

## Friends and Settings

Friends lists builders followed in this browser. The only available profile is @mager. An empty list explains how to follow a builder; a followed profile provides View work and Unfollow controls. Friends and the public profile use the same local follow preference. There are no mutual friend requests, remote follows, or new accounts.

Settings → Workspace → Reset my workspace clears local project and contribution drafts, featured order, the weekly plan, saved projects, and follows. It keeps the invite cookie and theme choice. The reset first stores one local restore copy under `sidework-reset-backup-v1`; Restore previous workspace restores that copy. A later reset replaces the copy. This is recovery in the same browser and origin, not a downloaded backup or public publishing. A successful reset or restore opens Friends. Settings also holds Appearance with Light, Dark, and System choices, and Invite access with Lock Sidework. Theme controls appear only in Settings.

The workbench is titled Your workbench. A fresh or reset workspace has no local projects or profile selections. Its overview links to import, story creation, and Friends. Public @mager contribution evidence remains available and is labeled separately from local work.

## Repository import

After entering the site, people can open /onboarding/, supply a GitHub handle, and read all pages of that handle’s public owned repositories. Forks and archived repositories are included by default and can be filtered out. People can search, select matching results in bulk, clear the selection, or choose individual repositories. Projects already in the workbench are excluded from duplicate imports. A fresh workbench can import repositories that also appear in the public snapshot.

Selected repositories become drafts in the current browser’s workbench. Imports preserve repository links, descriptions, and primary language; a safe repository homepage becomes the project link when present. The importer keeps existing project stories, contribution drafts, profile-draft order, and plans. It supports up to 5,000 local project drafts, subject to browser storage limits. GitHub request limits, missing handles, cancellation, and storage failures are reported. Publishing, private repositories, OAuth, and account ownership checks are not connected.

## Project stories and profile draft

The workbench can create and edit local project stories. Each story can include a short tagline, description, stage, stack, HTTPS screenshot with descriptive text, source link, reason for building, and lessons learned. A live preview shows the story while it is edited. Edits to seeded projects are local overrides and do not change the public @mager snapshot. Save failures retain unsaved form text and the last saved draft.

People can feature up to six projects, change their order with labeled earlier/later buttons, and inspect an asymmetric private profile draft. Fresh workspaces start with no projects or featured selections. Existing version 1 workspaces without an `includeExamples` field retain the seeded projects. Feature changes and order stay in this browser. Bulk GitHub imports preserve this order and existing story fields.

Export draft downloads a private JSON copy of only the selected projects and stories in order. Its prototype handle remains @mager. It excludes unselected projects, contribution drafts, and plans. Profile draft → Review a draft file can restore a valid version 1 export after review and an explicit save. Public publishing and account-specific profiles remain unconnected.

## Contribution stories

Six authored @mager stories from the software page explain upstream work. The public `/mager/` profile shows them below personal projects. The separate contribution index, detail pages, and draft editor require invite access. Detail pages show selected PR or commit evidence with source links, check dates, and explicit PR states. This selection does not claim a complete history or prove every statement in the authored story.

People can create and edit up to 20 private contribution drafts in this browser. Each has a project name, @handle, upstream repository, story, and a GitHub PR, issue, or commit URL for that repository. The editor validates the URL format and repository match; it does not verify the handle or source claims. A live preview shows the draft. Project imports, draft review, and workbench saves preserve contribution drafts. Workspace reset and restore include them. Contribution publishing, export, and agent preparation are not connected.

## Agent setup and draft review

The agent mode is Operate: an agent reads source evidence and prepares a draft for the user to review. The user can ask, “Set up my Sidework profile from my GitHub projects.” Sidework provides its own Streamable HTTP MCP endpoint and a Claude Code plugin distributed from this repository. [docs/agents.md](docs/agents.md) is the capability and setup reference.

The MCP has six tools: read the profile, search published projects, read dated contributions, discover curated opportunities, page through public GitHub repositories, and prepare one to six projects in featured order. It also has one profile resource and one setup prompt. The plugin supplies setup-profile and find-contribution skills. Agents must use source evidence and the author’s input for project stories. They cannot read browser-local drafts, save a profile, publish, delete, send messages, or change GitHub. Exported drafts can supply the author’s latest local edits.

Workbench → Agents issues a token with catalog:read, github:public, and draft:prepare scopes. It expires within 24 hours or when its source invite session expires, whichever is first. It is bound to the endpoint origin, grants no website access, and represents invite access rather than verified GitHub identity. The page keeps the token in memory, not localStorage. This remains a one-profile prototype for @mager; OAuth, individual accounts, and private GitHub access are not connected.

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

Project browsing uses Experience mode. The profile and discovery index show a two-column project grid on desktop and one column on mobile. Normal links open separate, full-width project detail pages. Content has no card borders or panel frames. Real screenshots keep their original colors and natural ratio on detail pages. The prxps entry uses a real test-account screenshot captured with owner permission on November 5, 2026. Each detail page shows purpose, description, source metadata, app and save actions, and More by @mager links. These detail routes require an invite; the exact /mager/ profile remains public.

Contribution browsing uses the same open, monochrome layout. Short story rows link to separate detail pages. The editor places its form beside a private preview on desktop and above it on mobile. Copy stays brief; source details belong with the evidence.

Settings uses Operate mode. It holds all theme controls, workspace reset and restore, and invite locking. Headers link to Settings. The private workbench retains its editing, showcase, import, and agent-review flows. This November 5, 2026 direction supersedes the compact software browser and project tabs.


## Project metadata, first version

Each project can have one category, one software type, a short intended audience, and up to five concrete features. The description explains the task and how the software works; the tagline names the main action. Categories describe purpose (Developer tools, Productivity, Creative tools, Learning, Games & recreation, Utilities). Software types describe delivery (Web app, Command-line tool, Desktop app, Mobile app, Browser extension, Library, API / service). Programming languages remain in the existing stack field.

The shared vocabulary lives in `src/scripts/project-metadata.mjs`. Missing metadata is allowed, including in older version 1 drafts. GitHub imports provide repository facts and leave classification, audience, and features blank for author review. Imports preserve existing authored metadata. The editor, preview, JSON backups, draft review, and MCP use the same fields and limits. Agents can prepare them from evidence but cannot publish. The gallery has category links that work without JavaScript; project pages show the audience and features. Add categories only when real projects need them; nested categories, rankings, and automatic classification are outside this first version.

## Latest project: Cántalo

Cántalo is first in the public project gallery. It pairs Spotify listening with original Spanish practice phrases and a personal dictionary. Its real MATADORA screenshot retains the bright source colors. The project detail links to the requested song, project story, and private `mager/cantalo` repository. Adding it to the public snapshot does not change browser-local drafts or their selected order.
