# Sidework

A home for personal software and open source contributions.

Sidework connects three parts of a developer’s work: the projects they build, the changes they make to shared tools, and the things they want to learn next. This first prototype uses @mager’s real projects and public contribution evidence.

## Run locally

Use Node.js 22.19 or later.

```sh
npm install
node scripts/create-invite.mjs
npm run dev
```

- `/invite/`: server-checked invitation for discovery and management tools.
- `/friends/`: invite-only local follows and first-project entry.
- `/settings/`: invite-only Appearance, workspace reset and restore, and invite locking.
- `/projects/cantalo/`, `/projects/homeport/`, `/projects/moodsh/`, `/projects/perch/`, `/projects/prxps/`: invite-only project detail pages.
- `/contributions/`, `/contributions/[slug]/`, `/contributions/drafts/`: invite-only stories, source evidence, and private draft editor.
- `/onboarding/`: search and bulk import of all public repositories owned by a GitHub handle.
- `/mager/`: public profile with personal projects, six contribution stories, and recent pull requests; available without an invite.
- `/`: people-first discovery with real software previews and a local saved collection.
- `/workbench/`: project story editor, private profile draft, searchable contribution history, discovery, and a four-project weekly plan.
- `npm test`: state, URL safety, contribution normalization, saved collection, follows, theme, and workspace reset checks.
- `npm run build`: Vercel server output in `.vercel/output/`.

## What works

The profile and discovery index show five projects, with Cántalo first in two columns on desktop and one column on mobile. Normal links open separate, full-width project pages with no content borders or panel frames. Detail pages show an original-color screenshot at its natural ratio, purpose, source metadata, app and save actions, and More by @mager links. prxps uses a real test-account screenshot captured with owner permission. Project navigation works without JavaScript. Saved links open the matching detail page. The exact /mager/ profile stays public; project detail pages require invite access. Six contribution stories follow the project index on @mager’s profile. The separate workbench retains editing and planning tools.

- Public project showcase with demo, source, and build-log links.
- Friends with empty and followed-profile views for the real @mager profile.
- Empty new workspaces and a local reset with a restore copy.
- Six authored contribution stories with selected PR and commit evidence, plus a private local draft editor.
- Contribution search and status filters, with source links and dated evidence.
- Skill filters for four curated contribution opportunities.
- Saved opportunities and planned / in progress / submitted states.
- Local project stories with a tagline, description, stage, screenshot, source links, and optional notes about purpose and learning.
- Live project preview, up to six featured projects, accessible ordering controls, and JSON export of the selected profile draft.
- An authenticated MCP endpoint and Claude Code plugin for public GitHub discovery and agent-prepared profile drafts, with direct review links.
- Public GitHub refresh for @mager’s repositories and recent pull requests, with loading, timeout, and rate-limit recovery.
- Markdown export of the public work record.
- Responsive layouts, keyboard navigation, and Light, Dark, and System themes.

The interface uses black, white, and neutral gray to keep attention on the work. Project screenshots retain their original colors. System is the default theme. The theme selector appears only in Settings → Appearance. Headers and the import page link to Settings. A saved choice applies before paint; System follows changes to the device theme. Theme changes also update other open tabs. Without JavaScript, CSS follows the device theme.

## Prototype boundaries

An invitation unlocks the site for seven days. It is shared access, not a user account. There is no multi-user backend, automatic synchronization, or connected social graph. Saves and follows are browser-local preferences. Friends uses the same follow preference as the public profile. Local drafts and plans use `localStorage` and are available to anyone using the same browser profile. They are not posted to GitHub or included in the public profile. Refreshed GitHub results last for the current visit; saved plans and local drafts survive reloads when browser storage is available.

The profile is a committed snapshot. Updating a local draft does not publish it. To update the profile, edit `src/data/projects.ts`, `src/data/contribution-stories.json`, or the contribution snapshot and rebuild. Source links provide the current GitHub state. All routes use `noindex` while this remains a prototype.

The weekly goal counts distinct saved projects marked submitted by the user. It does not infer a merge or verify a submission. Opportunity availability is a dated observation; check the issue and related PRs before starting. Shiki’s example already has related work and needs coordination.

## Data and assets

- Six recent PR states were fetched from GitHub on November 4, 2026. The snapshot preserves merged, draft, open, and closed as separate states.
- Older contribution evidence comes from @mager’s October 12, 2026 [public contribution record](https://mager.co/software/contributions.json). The workbench displays a selection; it does not claim a full GitHub history or complete activity totals.
- Six contribution stories come from @mager’s software page, checked November 5, 2026. Their selected evidence retains its own check dates and states; it is not a complete activity record.
- Cántalo’s description and features were checked against its live MATADORA page and `mager/cantalo` README on November 5, 2026. Its repository is private; no source code is included in Sidework.
- Other project descriptions and links come from [@mager’s software directory](https://mager.co/software/).
- The illustrated @mager portrait is an existing asset from magerblog, by [@hopperdraws](https://x.com/hopperdraws). It is included for this profile; it is not a reusable product logo.
- The Homeport, Mood Shell, and Perch screenshots remain on @mager’s existing Vercel Blob image host. Real Cántalo and prxps captures are stored at `public/images/cantalo-matadora.jpg` and `public/images/prxps-games.jpg`. Asset origins and permission notes are in `docs/assets.json`.

## Typography

Anybody gives the wordmark its narrow, rounded shape. Bricolage Grotesque supports headings, descriptions, navigation, and controls. Automatic optical sizing, .005em body tracking, and 1.6 line height keep small text clear. Martian Mono marks project names, @handles, repository identifiers, and agent commands. Compact headings and source labels keep the focus on the software; descriptions retain the reading face. Text sizes use rem units.

The three active Latin WOFF2 subsets are self-hosted. They are self-hosted with `font-display: swap`; the interface and display fonts are preloaded. No external font request is needed. Other writing systems use the fallback stack. Sources and SIL Open Font Licenses are in `public/fonts/`.

## Next build

1. Add a GitHub App with explicit repository selection and server-side synchronization.
2. Add accounts, profile ownership, and an explicit publish workflow.
3. Connect follows between accounts, project updates, and opportunity recommendations based on stated learning goals.
4. Add other source providers behind the same contribution model.

Keep project ownership separate from upstream contribution credit. Keep activity separate from learning and impact. Never rank people by raw commit counts.

## Project stories and profile drafts

A fresh workbench starts without projects or featured selections. Import repositories or create a story, then open My projects → Edit story. Older version 1 workspaces without an `includeExamples` field keep the seeded examples. Changes to a curated project create a local copy; they do not change the committed public profile. The editor previews safe text, HTTPS screenshots, and project links. It warns before discarding unsaved changes and retains the form when browser storage rejects a save.

Feature up to six projects, then open Profile draft to change their order. Export draft downloads selected stories as `sidework-profile-draft.json`, marked `private-draft`. This export includes projects only; it does not include contribution drafts. Review a draft file restores a backup or opens an agent-prepared file after review. Agents can also return a direct review link. Saving a reviewed draft updates matching local stories and replaces featured order; unrelated projects and weekly plans remain. Public publishing is not connected. Local drafts remain tied to this browser and origin.

## Contribution stories and drafts

`/contributions/` shows six authored @mager stories from the software page. Each detail page separates the story from selected PR or commit evidence, with source links and check dates. PR states remain explicit; commits do not receive a merge state. These routes require an invite. The exact public `/mager/` profile embeds the same committed stories.

`/contributions/drafts/` previews and saves up to 20 private stories in this browser. Each needs a project name, @handle, upstream repository, description, and HTTPS GitHub PR, issue, or commit URL from that repository. URL validation does not verify identity, authorship, or current source state. Contribution drafts use `contributionDrafts` in `sidework-workbench-v1`; project imports, draft review, and workbench saves preserve them. Reset and restore include them. Contribution publishing, export, and agent draft preparation are not connected.

## Friends and starting fresh

After a direct invite visit, or an invite request for `/`, access opens Friends. Other explicit return paths are preserved. Friends lists local follows and offers the sole public profile, @mager. Follow and Unfollow do not send requests or create a shared social record.

Open Settings → Workspace → Reset my workspace to return to an empty workspace. The reset clears local project and contribution drafts, featured order, the weekly plan, saves, and follows. It keeps invite access and the theme choice. Before changing those values, it stores one restore copy in `localStorage` under `sidework-reset-backup-v1`. Restore previous workspace recovers that copy. Each later reset replaces it; clearing browser storage removes it. The copy stays in the same browser and origin. A successful reset or restore opens Friends.

The public @mager profile and its dated evidence remain unchanged. Your workbench labels that public evidence separately from local work. A fresh workspace can import a repository even when it is part of the public snapshot.

## Agent connections

Open Workbench → Agents to create a scoped token and connect Claude Code or another MCP client. Six tools read committed records, find public GitHub repositories, and prepare drafts for review. They cannot publish or read browser storage. The plugin lives in `plugins/sidework`; `.claude-plugin/marketplace.json` makes it installable from `mager/sidework`. See [the agent guide](docs/agents.md) for setup and limits.

## License

Code is MIT licensed. The portrait, screenshot, personal project descriptions, and third-party contribution records retain their original rights and attribution; the code license does not grant rights to reuse those assets as your own identity or work.

## Invite access and deployment

Live site: https://sidework-ten.vercel.app. The requested `sidework.vercel.app` alias was already in use.

Astro renders all pages on the server with the Vercel adapter. Middleware requires a signed, HTTP-only cookie for every application route except `/invite/`, the exact `/mager/` profile, and `/api/mcp`, which enforces its own scoped agent token. Responses use `private, no-store`. Missing configuration closes access to protected routes; the public profile stays available. Static CSS, scripts, fonts, and the public portrait remain public; the source repository and its committed showcase data are public too. An invitation does not make those assets confidential.

Run `node scripts/create-invite.mjs` once. It writes `.env` and `.sidework-invite` with owner-only permissions, and refuses to overwrite existing files. Both are ignored by Git. Read the code from `.sidework-invite` and send it only to intended invitees. The first prototype uses a reusable invitation, not a single-use code or identity check.

Configure `SIDEWORK_INVITE_HASHES` and `SIDEWORK_SESSION_SECRET` as sensitive Vercel environment variables for production and preview. The hashes are comma-separated SHA-256 digests of high-entropy invite codes. Removing a hash revokes that code and its sessions after redeployment. Rotating the session secret ends every session. Keep codes and secrets out of client code, logs, and Git. Generate codes with at least 24 random bytes; never use a short guessable password. `Lock Sidework` clears this browser’s access cookie; local drafts stay in the browser.

Public repository import requests GitHub directly from the browser. It reads pages of 100 until complete; a failed page does not return partial success. Forks and archived repositories are included and can be filtered. Search, bulk selection, duplicate checks, cancellation, API errors, and storage errors are handled. Imported drafts persist in the current browser, up to 5,000 projects, and do not publish to a profile or claim verified ownership. Organization-owned repositories are not part of a user’s owned-repository list; enter the organization handle to find its public repositories.
