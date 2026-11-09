# Sidework

A home for personal software and open source contributions.

Sidework connects three parts of a developer’s work: the projects they build, the changes they make to shared tools, and the things they want to learn next. This first prototype uses @mager’s real projects and public contribution evidence.

## Run locally

Use Node.js 22.19 or later.

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4345
```

Use [the setup guide](docs/github-auth.md) for GitHub sign-in and Firestore. Local access uses a short-lived Vercel OIDC token. Missing configuration leaves the public profile available and shows signup as unavailable.

- `/signup/`: GitHub sign-in, waitlist signup, and a preview of @mager’s projects.
- `/waiting/`: signed-in waitlist status, Check access, and optional email preferences.
- `/invite/`: old links redirect to signup; codes no longer create sessions.
- `/friends/`: access-controlled local follows and first-project entry.
- `/settings/`: access-controlled Appearance, workspace reset and restore, sign-out, and an owner-only Open admin link.
- `/admin/connect/`: main-site sign-in transfer to the separate admin site; it does not expose account records.
- `/projects/nextmove/`, `/projects/cantalo/`, `/projects/homeport/`, `/projects/moodsh/`, `/projects/perch/`, `/projects/prxps/`: access-controlled project detail pages.
- `/contributions/`, `/contributions/[slug]/`, `/contributions/drafts/`: access-controlled stories, source evidence, and private draft editor.
- `/onboarding/`: search and bulk import of all public repositories owned by a GitHub handle.
- `/mager/`: public profile with one list of personal projects and external contribution stories; available without an invite.
- `/`: people-first discovery with real software previews and a local saved collection.
- `/workbench/`: project story editor, private profile draft, searchable contribution history, discovery, and a four-project weekly plan.
- `npm test`: state, URL safety, contribution normalization, saved collection, follows, theme, and workspace reset checks.
- `npm run build`: Vercel server output in `.vercel/output/`.

## What works

The profile and Explore alternate six personal projects with six authored external contribution stories, starting with Nextmove and Uber Direct SDK. Both use the same compact row layout: two columns on desktop and one on mobile. Small project thumbnails keep their original colors; full screenshots appear only on detail pages. All work, Projects, and Contributions are normal links that work without JavaScript. Categories appear only under Projects; existing category URLs still work. The contribution list excludes repositories owned by the story author. Each contribution row shows its verified GitHub owner avatar and a direct repository link; its title opens the Sidework story.

Normal links open separate detail pages with no content borders or panel frames. Project pages use compact headings and place the screenshot beside the story on desktop. At 1000px and below, the image sits above the story; at 760px and below, the story uses one column. Screenshots keep their natural ratio and source size limits. Pages show purpose, source metadata, text-only technology tags, app and save actions, and More by @mager links. prxps uses a real test-account screenshot captured with owner permission. Saved links open the matching detail page. The exact /mager/ profile stays public; detail pages require approved account or valid legacy session access. Raw PR history stays in the workbench, with selected evidence on contribution detail pages. Add a contribution opens the existing private editor; it does not publish.

- Public project showcase with demo, source, and build-log links.
- Friends with empty and followed-profile views for the real @mager profile.
- Empty new workspaces and a local reset with a restore copy.
- Six authored contribution stories with selected PR and commit evidence, plus a private account draft editor.
- Contribution search and status filters, with source links and dated evidence.
- Skill filters for four curated contribution opportunities.
- Saved opportunities and planned / in progress / submitted states.
- Private project stories with a tagline, description, stage, screenshot, source links, and optional notes about purpose and learning.
- Live project preview, up to six featured projects, accessible ordering controls, and JSON export of the selected profile draft.
- An authenticated MCP endpoint and Claude Code plugin for public GitHub discovery and agent-prepared profile drafts, with direct review links.
- Public GitHub refresh for @mager’s repositories and recent pull requests, with loading, timeout, and rate-limit recovery.
- Markdown export of the public work record.
- Responsive layouts, keyboard navigation, and Light, Dark, and System themes.

The interface uses black, white, and neutral gray to keep attention on the work. Project screenshots retain their original colors. System is the default theme. The theme selector appears only in Settings → Appearance. Home and Friends use the same header, including Saved and Import projects. Signed-in headers show the GitHub avatar at the far right; it links to Settings and has an accessible @handle label. Waiting accounts return to preview preferences, and legacy sessions use a profile icon. A saved choice applies before paint; System follows changes to the device theme. Theme changes also update other open tabs. Without JavaScript, CSS follows the device theme.

## Owner admin

The separate [admin site](https://sidework-admin.vercel.app) shows signup records from Firestore. Open Settings → Admin → Open admin as the configured owner. Search by @handle or email, use visible choices for access status and email consent, and inspect signup and last sign-in dates. Use Grant access for a waiting account or Manage access to return an approved account to waiting. Each change records an audit event. Account deletion and email delivery are unavailable.

The admin uses a separate eight-hour session and checks the approved owner account by GitHub numeric ID on every private request. A successful owner check renews a valid session after four hours. Sign-in uses the main site and a one-time PKCE handoff. Both Vercel projects use this repository on `main`; deploy both when their shared sign-in flow changes. See [admin setup](docs/admin.md) for route limits, keyless database access, and checks.

## Prototype boundaries

GitHub signup records the verified numeric ID, login, verified email, waiting status, and optional update consent in Firestore. Only the configured owner starts approved. Other accounts wait for the owner to grant access. Check access opens the Workbench after approval. The account session lasts 30 days and renews after 15 days when the server verifies the current account. Email delivery is not connected. GitHub OAuth and Firestore are live. Local and production checks covered owner access, waiting access, consent changes, sign-out, and repeat sign-in. A production HTTP callback check covered cancellation with valid OAuth state.

Private exports, draft review, and MCP templates now use the signed-in account’s numeric GitHub ID and current @handle. Manual approval grants private tools. The [MVP plan](docs/mvp.md) tracks the remaining work for a public release. Approved accounts save project stories, featured order, and contribution drafts on the server. Another browser loads those private drafts after sign-in. There is no public multi-profile publishing or shared social graph. Saves, follows, and plans remain in browser `localStorage`, with a GitHub numeric ID suffix for signed-in accounts. Existing browser drafts remain intact until an explicit browser reset; import to the account requires review and a save. Legacy sessions keep browser-local drafts, with no automatic migration of legacy keys. Theme stays browser-global. Anyone with access to the browser profile can inspect its local data. Drafts and plans are not posted to GitHub or included in the public profile. See [private account drafts](docs/account-drafts.md) for storage, conflicts, import, and recovery.

The profile is a committed snapshot. Saving a private draft does not publish it. To update the profile, edit `src/data/projects.ts`, `src/data/contribution-stories.json`, or the contribution snapshot and rebuild. Source links provide the current GitHub state. All routes use `noindex` while this remains a prototype.

The weekly goal counts distinct saved projects marked submitted by the user. It does not infer a merge or verify a submission. Opportunity availability is a dated observation; check the issue and related PRs before starting. Shiki’s example already has related work and needs coordination.

## Data and assets

- Six recent PR states were fetched from GitHub on November 4, 2026. The snapshot preserves merged, draft, open, and closed as separate states.
- Older contribution evidence comes from @mager’s October 12, 2026 [public contribution record](https://mager.co/software/contributions.json). The workbench displays a selection; it does not claim a full GitHub history or complete activity totals.
- Six contribution stories come from @mager’s software page, checked November 5, 2026. Their selected evidence retains its own check dates and states; it is not a complete activity record.
- Nextmove’s description and features were checked against its live site and the `mager/blunder-club` README on November 8, 2026. Its sharp 2× guest-game capture is stored at `public/images/nextmove-chess.png`.
- Cántalo’s description and features were checked against its live MATADORA page and `mager/cantalo` README on November 5, 2026. Its repository is private; no source code is included in Sidework.
- Other project descriptions and links come from [@mager’s software directory](https://mager.co/software/).
- The illustrated @mager portrait is an existing asset from magerblog, by [@hopperdraws](https://x.com/hopperdraws). It is included for this profile; it is not a reusable product logo.
- The Homeport and Mood Shell screenshots remain on @mager’s existing Vercel Blob image host. Real Cántalo and prxps captures are stored at `public/images/cantalo-matadora.jpg` and `public/images/prxps-games.jpg`. Perch uses `public/images/perch-demo.png`, a 2× capture of its built-in demo, labeled as sample data. Detail images use their actual dimensions, stay below their source width, and link to the full-size image. Asset origins and permission notes are in `docs/assets.json`.

## Typography

Anybody gives the wordmark its narrow, rounded shape. Bricolage Grotesque supports headings, descriptions, navigation, and controls. Automatic optical sizing, .005em body tracking, and 1.6 line height keep small text clear. Martian Mono marks project names, @handles, repository identifiers, and agent commands. Compact headings and source labels keep the focus on the software; descriptions retain the reading face. Text sizes use rem units.

The three active Latin WOFF2 subsets are self-hosted. They are self-hosted with `font-display: swap`; the interface and display fonts are preloaded. No external font request is needed. Other writing systems use the fallback stack. Sources and SIL Open Font Licenses are in `public/fonts/`.

## Next build

1. Add profile ownership, preview, publish, edit, and unpublish for projects and contributions.
2. Complete access, recovery, and deletion checks before opening the preview.
3. Add shared follows, saves, and source refresh for V1.

See [the MVP and V1 release plan](docs/mvp.md) for acceptance checks and current limits.

Keep project ownership separate from upstream contribution credit. Keep activity separate from learning and impact. Never rank people by raw commit counts.

## Project stories and profile drafts

A fresh workbench starts without projects or featured selections. Import repositories or create a story, then open My projects → Edit story. Older browser version 1 workspaces without an `includeExamples` field keep the seeded examples. Account workspaces start empty. Explicit browser import includes selected examples as private copies; it does not change the committed public profile. The editor previews safe text, HTTPS screenshots, and project links. It warns before discarding unsaved changes and retains the form when a save fails.

Feature up to six projects, then open Profile draft to change their order. Export draft downloads selected stories as `sidework-profile-draft.json`, marked `private-draft`. This export includes projects only; it does not include contribution drafts. Review a draft file restores a backup or opens an agent-prepared file after review. Agents can also return a direct review link. Saving a reviewed profile draft updates matching private stories and replaces featured order; unrelated projects, contribution drafts, and weekly plans remain. Approved accounts save to the server; legacy sessions save in this browser. Public publishing is not connected.

Backups offers a separate download of all loaded account projects, contribution drafts, and featured order. It also offers explicit review of browser drafts and full account backup restore. Full restore replaces all private drafts and order after review; download the current account drafts first. The backup must have the same numeric account ID. Failed saves retain changes and offer a recovery download.

## Contribution stories and drafts

`/contributions/` shows six authored @mager stories from the software page. Each detail page separates the story from selected PR or commit evidence, with source links and check dates. PR states remain explicit; commits do not receive a merge state. These routes require approved account or valid legacy session access. The exact public `/mager/` profile and Explore place the same external stories beside personal projects in one work list.

`/contributions/drafts/` previews and saves up to 20 private stories to an approved account, or in this browser for a legacy session. Each needs a project name, @handle, upstream repository, description, and HTTPS GitHub PR, issue, or commit URL from that repository. URL validation does not verify identity, authorship, or current source state. Account contribution drafts use the server `contributionDrafts` field; project imports, profile draft review, and workbench saves preserve them. Full account backups include them. Existing browser copies remain in `sidework-workbench-v1` (with `:github:<numeric-id>` for accounts). Settings reset and restore affect those browser copies only. Contribution publishing and agent draft preparation are not connected.

## Friends and starting fresh

After GitHub sign-in, approved accounts open Friends and waiting accounts open the pending page. Friends lists local follows and offers the sole public profile, @mager. Follow and Unfollow do not send requests or create a shared social record.

Open Settings → Workspace → Reset my workspace to clear browser data. The reset clears browser project and contribution drafts, browser featured order, the weekly plan, saves, and follows. It does not delete server account drafts or change their featured order. It keeps access and the theme choice. Before changing those values, it stores one restore copy in `localStorage` under `sidework-reset-backup-v1` (with `:github:<numeric-id>` for accounts). Restore previous workspace recovers that copy. Each later reset replaces it; clearing browser storage removes it. The copy stays in the same browser and origin. A successful reset or restore opens Friends.

The public @mager profile and its dated evidence remain unchanged. Your workbench labels that public evidence separately from private work. A fresh workspace can import a repository even when it is part of the public snapshot.

## Agent connections

Open Workbench → Agents to create a scoped token and connect Claude Code or another MCP client. Six tools read committed records, find public GitHub repositories, and prepare drafts for review. They cannot publish, read browser storage, or read or write private server drafts. The plugin lives in `plugins/sidework`; `.claude-plugin/marketplace.json` makes it installable from `mager/sidework`. See [the agent guide](docs/agents.md) for setup and limits.

## License

Code is MIT licensed. The portrait, screenshot, personal project descriptions, and third-party contribution records retain their original rights and attribution; the code license does not grant rights to reuse those assets as your own identity or work.

## Account access and deployment

Live site: https://sidework-ten.vercel.app. The requested `sidework.vercel.app` alias was already in use.

Astro renders all pages on the server with the Vercel adapter. On the main site, public application routes are `/admin/connect/` (sign-in transfer only), `/signup/`, the exact `/auth/github/` start and `/auth/github/callback/` routes, the exact `/mager/` profile, `/invite/` (redirect only), and `/api/signout`. Waiting accounts may use `/waiting/` and `/api/account/updates`. Other website routes require an approved account session or a valid legacy invite cookie. `/api/account/drafts` requires an approved account session and a matching expected-account header; legacy cookies do not grant draft API access. `/api/mcp` requires its own scoped bearer token. Account tokens recheck approval in the database on each request.

Responses use `private, no-store`. Protected account routes fail closed when the database is unavailable; the public profile stays available. Static assets and committed showcase data remain public. See [GitHub sign-in setup](docs/github-auth.md) for environment variables, keyless database access, access limits, and recorded checks.

Old invite codes are no longer accepted. Existing invite cookies and version 1 agent tokens remain valid until expiry or removal of their invitation hash. Keep `SIDEWORK_INVITE_HASHES` and the existing `SIDEWORK_SESSION_SECRET` to preserve those sessions. Rotating the session secret ends all signed sessions and tokens. Sign out clears this browser’s account, OAuth, and legacy invite cookies; local work remains.

Public repository import requests GitHub directly from the browser. It reads pages of 100 until complete; a failed page does not return partial success. Forks and archived repositories are included and can be filtered. Search, bulk selection, duplicate checks, cancellation, API errors, and storage errors are handled. Imported drafts save to the approved account, or in the current browser for a legacy session. Account drafts allow up to 5,000 projects within the 700,000-byte limit. Import does not publish a profile or verify ownership. Organization-owned repositories are not part of a user’s owned-repository list; enter the organization handle to find its public repositories.
