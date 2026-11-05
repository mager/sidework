# Sidework

## Users and purpose

Developers who make personal software and contribute to other projects. They need a shareable record that explains what their work does, plus a practical place to discover and plan useful contributions.

## Positioning

A social space for builders, nerds, coders, and vibers to discover personal software and meet its makers. Project ownership and upstream contributions belong in one story but retain distinct attribution. GitHub supplies evidence; authored descriptions supply meaning.

## Operating context

The exact `/mager/` profile route is public and can be shared without an invite. Discovery, workbench, and import routes require a valid invite session. The invite page is their entry point. Reusable invite codes grant seven days of access. They do not create individual accounts or verify a GitHub identity. Lock Sidework clears the access session.

The prototype has one source-backed maker profile, @mager, and browser-local workbench state. Public GitHub data can be read without sign-in or account permissions. No multi-user or social service is connected. Local saves, follows, plans, and imported drafts are not shared between browsers or published to a profile.

The deployed preview is https://sidework-ten.vercel.app. The originally requested hostname was unavailable.

## Repository import

After entering the site, people can open /onboarding/, supply a GitHub handle, and read all pages of that handle’s public owned repositories. Forks and archived repositories are included by default and can be filtered out. People can search, select matching results in bulk, clear the selection, or choose individual repositories. Existing seed and local projects are excluded from duplicate imports.

Selected repositories become drafts in the current browser’s workbench. Imports preserve repository links, descriptions, and primary language; a safe repository homepage becomes the project link when present. The importer keeps existing stories, profile-draft order, and plans. It supports up to 5,000 local project drafts, subject to browser storage limits. GitHub request limits, missing handles, cancellation, and storage failures are reported. Publishing, private repositories, OAuth, and account ownership checks are not connected.

## Project stories and profile draft

The workbench can create and edit local project stories. Each story can include a short tagline, description, stage, stack, HTTPS screenshot with descriptive text, source link, reason for building, and lessons learned. A live preview shows the story while it is edited. Edits to seeded projects are local overrides and do not change the public @mager snapshot. Save failures retain unsaved form text and the last saved draft.

People can feature up to six projects, change their order with labeled earlier/later buttons, and inspect an asymmetric private profile draft. The initial selection uses the four seeded projects. Feature changes and order stay in this browser. Bulk GitHub imports preserve this order and existing story fields.

Export draft downloads a private JSON copy of only the selected projects and stories in order. Its prototype handle remains @mager. It excludes unselected projects and plans. Profile draft → Review a draft file can restore a valid version 1 export after review and an explicit save. Public publishing and account-specific profiles remain unconnected.

## Agent setup and draft review

The agent mode is Operate: an agent reads source evidence and prepares a draft for the user to review. The user can ask, “Set up my Sidework profile from my GitHub projects.” Sidework provides its own Streamable HTTP MCP endpoint and a Claude Code plugin distributed from this repository. [docs/agents.md](docs/agents.md) is the capability and setup reference.

The MCP has six tools: read the profile, search published projects, read dated contributions, discover curated opportunities, page through public GitHub repositories, and prepare one to six projects in featured order. It also has one profile resource and one setup prompt. The plugin supplies setup-profile and find-contribution skills. Agents must use source evidence and the author’s input for project stories. They cannot read browser-local drafts, save a profile, publish, delete, send messages, or change GitHub. Exported drafts can supply the author’s latest local edits.

Workbench → Agents issues a token with catalog:read, github:public, and draft:prepare scopes. It expires within 24 hours or when its source invite session expires, whichever is first. It is bound to the endpoint origin, grants no website access, and represents invite access rather than verified GitHub identity. The page keeps the token in memory, not localStorage. This remains a one-profile prototype for @mager; OAuth, individual accounts, and private GitHub access are not connected.

Prepared drafts return a review link and JSON data. The link carries compressed draft data in its fragment, not a server inbox. Sidework removes the fragment before showing the review. The original link is not encrypted and may remain in the agent conversation, browser history, or clipboard tools. Long drafts use a JSON file; Review a draft file accepts the same format up to 64 KB.

The review shows which projects will be added or replace local stories. Nothing is saved until the user chooses Save these projects. A successful save updates matching IDs or source URLs and sets the featured order. Other projects and the weekly plan remain. Invalid drafts and failed writes leave saved state unchanged. A pending review is held in memory and is lost on reload; the user can reopen its link or file. No agent or review action changes the committed public profile.

## Evidence on hand

Four personal projects from magerblog, six recent PR states checked November 4, 2026, selected older PR evidence from October 12, and four dated contribution opportunities.

## Product principles

- Show what software does before activity counts.
- Link contribution claims to evidence and preserve status dates.
- Make discovery useful for a stated learning goal.
- Keep drafts, local plans, and published records distinct.
- Value small useful tools and upstream fixes without artificial rankings.

## Priority

The user selected a shareable developer profile and a personal projects/contributions workbench as the first priorities. The working name Sidework was explicitly selected.

## Confirmed visual direction

The shared identity uses self-hosted Bricolage Grotesque headings and body text, Martian Mono handles, project names and source metadata, and an Anybody wordmark. Moss/lime colors and the “Built with Astra” footer remain.

The user rejected the long public presentation because it still felt like a blog. The approved public mode is now Operate: a compact maker row and latest real contribution lead into a horizontal software switcher. One selected project shows its screenshot beside its purpose, stack, notes, app link, and source. Six compact contribution rows follow. The sticky header replaces the bottom dock; the manifest and marketing close are removed. Real anchors preserve direct links and all project content without JavaScript. The separate private workbench keeps its existing editing, showcase, import, and agent-review flows.
