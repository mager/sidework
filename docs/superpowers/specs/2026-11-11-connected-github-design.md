# Connected GitHub work: inventory and app design

Date: November 11, 2026. Status: proposed design, not implemented.

## Decision and scope

@mager selected review before new repositories appear publicly. The purpose is to replace repeated manual edits to the public profile with an account-owned import, review, and publish path. Projects and upstream contributions keep equal weight. Keep the compact black-and-white interface and color screenshots.

This document maps the current public catalog and GitHub discovery results to that path. The [source inventory](2026-11-11-github-inventory.json) records URLs and search scope. It is not a backup of private account drafts. No private account records were read or changed during this mapping. No discovered work has been published.

## What exists

`Studio.astro` reads six project records from `src/data/projects.ts` and six stories from `src/data/contribution-stories.json`. Its featured order is fixed. Detail pages read the same files. The workbench GitHub refresh is limited to one page of repositories and PRs, uses @mager explicitly, and lasts for that visit.

The repository importer already has pagination, selection, duplicate checks, and safe URLs. Approved accounts save private projects, featured order, and contribution drafts in `sidework_drafts/<GitHub numeric ID>`. That store has revision checks and approval checks. Saving does not publish. The missing pieces are durable source connections, contribution discovery, a review queue, and a separate published profile record.

## Map the current projects

| Project | GitHub match | Proposed action |
| --- | --- | --- |
| Nextmove | `mager/blunder-club`, ID `1438859433` | Link the existing story. Keep the Nextmove name and `/projects/nextmove/`; do not replace it with the repository name. |
| Homeport | `mager/homeport`, ID `1404386270` | Link the existing story and preserve its image, text, and URL. |
| Mood Shell | `mager/moodsh`, ID `1401814331` | Link the existing story; keep the display name separate from the repository name. |
| Perch | `mager/perch`, ID `1404334372` | Link the existing story; retain the labeled demo image. |
| Cántalo | Existing source is `mager/cantalo`; not returned by the public search | Keep as an authored project. The existing record says the repository is private. Do not request private repository access or remove the project because discovery cannot find it. |
| prxps | Existing record has a live URL but no repository URL | Keep as an authored project. Ask for a source match in the review screen; do not infer one from its name. |

Matching must use repository ID where known, then a validated canonical source URL for the initial link. Display names and similar slugs are not identity evidence. A project can remain manual. Repository visibility is not the visibility of a Sidework story.

## Additional projects for review

GitHub search returned 82 public, non-fork repositories. This count describes this search, not all repositories in the account. Forks and private repositories were not inventoried. The full list is in the JSON inventory.

Start the review list with these candidates. This is a proposed review order, not an approved featured order:

| Candidate | Source | Fit in Sidework |
| --- | --- | --- |
| Beatbrain | [mager/beatbrain-web](https://github.com/mager/beatbrain-web) | Personal project. Review the live URL and add a short purpose statement and screenshot. The GitHub description is empty. |
| kotsu | [mager/kotsu](https://github.com/mager/kotsu) | Learning project; the repository describes Japanese learning. Review its live URL and screenshot. |
| loooom | [mager/loooom](https://github.com/mager/loooom), [mager/loooom.xyz](https://github.com/mager/loooom.xyz), [mager/loooom-mcp](https://github.com/mager/loooom-mcp) | Three separate repository candidates. Offer a manual “link to existing project” choice if these should share one story. Do not merge by name alone. |
| dreaming-brain | [mager/dreaming-brain](https://github.com/mager/dreaming-brain) | Developer tool; the repository describes session capture and reviewed memory notes. |
| JLINC Buddy | [mager/jlinc-buddy](https://github.com/mager/jlinc-buddy) | Personal project, not an upstream JLINC contribution. The repository describes a community plugin. |
| JLINC Agent Trust Lab | [mager/jlinc-agent-trust-lab](https://github.com/mager/jlinc-agent-trust-lab) | Personal experiments. Keep separate from upstream contribution credit. |
| Sidework | [mager/sidework](https://github.com/mager/sidework) | Optional self-reference; review before adding it. |

Older repositories, examples, and archived projects remain searchable in the private review list. Do not put all 82 on the public profile. Empty GitHub descriptions stay empty until the author supplies text. A README can supply source material for a proposed description, but cannot silently replace the author's writing. No screenshots or live-site checks were made for these candidates in this mapping.

## Map contributions

Keep the existing six stories: `uber/uber-direct-sdk`, `pbakaus/impeccable`, `premint/premintbot`, `postmates/consul_mut_ex`, `spotify/apps-tutorial`, and `simplegeo/python-simplegeo`. Link each to its upstream repository and retain the authored summary. Spotify's existing evidence is direct commits; a PR-only importer would lose it.

The search returned 90 authored public PR records across 35 external repositories. It also returned 26 authored issue records and the latest 30 matching commented threads. Together these searches identify 48 repository candidates. These are search results, not complete contribution totals. The connector did not return reliable current PR states, so this mapping makes no new merged/open/closed claims.

| Candidate | Evidence found | Treatment |
| --- | --- | --- |
| Impeccable | Seven authored PR search results, plus issue and comment matches | Attach candidates to the existing story. Fetch current PR details before review. |
| last30days | [PR 1352](https://github.com/mvanhorn/last30days-skill/pull/1352), [PR 1353](https://github.com/mvanhorn/last30days-skill/pull/1353), and commented threads | New upstream story candidate. Do not use a single commit as a profile headline. |
| Buzz | [block/buzz PR 2875](https://github.com/block/buzz/pull/2875) | New documentation contribution candidate. |
| OpenClaw | [openclaw/openclaw PR 46653](https://github.com/openclaw/openclaw/pull/46653) | New code contribution candidate; verify its current state. |
| Uber Direct samples | Four PR search results in [uber/uber-direct-sdk-samples](https://github.com/uber/uber-direct-sdk-samples) | Separate repository candidate; offer a deliberate link to the SDK story. |
| Codex, Zed, AWS CLI, and other discussion matches | Commented issue threads | Private participation candidates. Find the exact authored comment before offering evidence; do not call these merged code or issue authorship. |
| Older work | PREMINT, Postmates, SimpleGeo, and other repository matches in the inventory | Keep dated history available for review. Do not replace it with only recent activity. |

An event, search hit, or repository association is a discovery hint. Verify the actor's GitHub numeric ID on the underlying PR, issue, review, comment, or commit before marking it as evidence. For commits, an unlinked author name or email is not enough. Record the exact item URL, activity type, actor ID, repository ID, source date, and checked date. Deduplicate by GitHub item ID and type. A PR found through several searches appears once. A comment and its parent issue remain distinct records.

## Fit the work into the existing app

| Surface | Change |
| --- | --- |
| Settings | Add a GitHub connection section: public sources, last checked time, Sync now, and Pause sync. Use the signed-in numeric ID; do not ask for the handle again. |
| Import projects (`/onboarding/`) | Keep repository search and selection. Show “Already linked”, “New project”, and “Link to existing project”. Default forks and archived projects out of the initial list but keep explicit filters. |
| Workbench | Add Review with a count of pending repositories/items. Each repository row shows the proposed project or contribution, source links, and Keep / Ignore. These are normal work rows, not large screenshot cards. |
| Project editor | Keep authored name, description, tags, screenshot, and selected order. Show imported GitHub facts separately. A source update does not overwrite an authored field. |
| Contribution editor | Replace the single evidence URL constraint with an explicit list of verified evidence. Keep the short authored story above it. Support code, issue, review, comment, and retained direct-commit evidence with accurate labels. |
| Profile draft | Preview both projects and contributions in the same compact list. Add Publish changes and Unpublish with revision checks. Keep preview and public state separate. |
| `/mager/` and detail pages | Read only the published record. Keep current URLs, thumbnail sizes, repository avatars/links, detail screenshots, and shared header. No activity firehose at the top. |
| Friends / admin | No new social graph or admin publishing controls. “Track repository” belongs to the private GitHub connection, not GitHub Watch or Follow. |

The flow is **GitHub → private review → saved draft → profile preview → Publish changes**. Keeping a candidate never publishes it. New repositories and new evidence always enter review, including new evidence for an already published repository. Already approved evidence may refresh factual state and checked dates automatically. New titles, descriptions, screenshots, links, and story text need review before a new public revision. Ignored candidates stay ignored across syncs and can be restored from an Ignored view.

## Approaches

1. **Reviewed connection — selected by @mager.** Save discovery results separately, review new work, and publish an explicit selection. This needs a queue and publication store, but preserves author control.
2. **Automatic public activity.** Less review work, but a comment can place a repository on the public profile. @mager did not select this.
3. **Continue editing committed files.** Lowest implementation cost, but fails the request for connected imports. Keep the current files only as initial migration input and a pre-migration fallback.

## Data and ownership proposal

Keep the existing private draft collection and account approval rules. Add server-only source connections/candidates keyed by account numeric ID and stable repository/item IDs. Store candidates in separate documents so activity history does not consume the existing 700 KB draft limit. Connection metadata includes enabled/paused status, last attempted/successful check, retry time, and pagination checkpoint. Candidates include new/kept/ignored status and a revision.

Use a distinct published profile record, keyed by numeric account ID, containing only the reviewed public projection and its publication revision. Do not serve private drafts or raw discovery responses from a public endpoint. Publish must name the exact draft revision and selected item IDs; a transaction rechecks approval and the expected publication revision. Concurrent edits cause a conflict, not a silent merge. After unpublish, do not restore the committed snapshot as a fallback. On a published-store outage, serve an explicitly retained last-published projection or a temporary unavailable response; never serve drafts.

Initial rollout: connection/review tools are account-scoped for approved users, but publication is owner-only at the existing `/mager/` route. Other accounts retain private preview/export. Public multi-user handles and route ownership are a separate rollout; do not open arbitrary paths in middleware. Keep existing detail-route access rules in this release. New owner project/contribution IDs must resolve in the existing detail routes after publication, with collision checks and stable legacy URLs. Source catalogs used by Explore, detail pages, exports, and MCP must read the same approved public projection; MCP still cannot read drafts or publish.

The current draft schema is intentionally strict. Introduce a versioned adapter for linked repository IDs and multi-item evidence. Preserve old JSON backups, browser drafts, current six-project featured limits, and current 20 contribution-story limits. Activity candidates do not count toward those limits. Do not truncate longer legacy descriptions or drop image dimensions/captions/story links when preparing migration; display a field-level review if a value cannot fit. Preserve existing authored fields when linking and preserve the saved featured order. Linking related repositories to one story requires an explicit selection; publication stores that mapping.

## Sync proposal and limits

Builder proposal: public-data-only REST polling for the first owner rollout; retain the current login-only OAuth scope and token-discard behavior. Start with Sync now and a refresh when the owner opens Workbench after the last successful check is older than one day. Show this accurately as “Checks when you visit”; do not claim an unattended background service. A later scheduled worker can reuse the same bounded sync service after hosting capacity and credentials are configured.

Use paginated public owned-repository discovery, authored PR/issue search, reviewed-PR search, commented-thread discovery, and recent public events as a supplement. Resolve exact comments/reviews before import. Use incremental checkpoints and a bounded request budget, shared rate-limit backoff, retry-after handling, and a lease to prevent duplicate jobs. A refresh must report partial coverage and continue later instead of claiming success for missing pages. Never clear older evidence when a recent search no longer contains it. Do not scan every comment on every repository without a bound. Requests go only to validated GitHub API URLs; do not fetch arbitrary user-supplied URLs or forward credentials through redirects.

GitHub's [events API](https://docs.github.com/en/rest/activity/events) exposes a limited recent window and is not real time. Its [search API](https://docs.github.com/en/rest/search/search) has pagination, result limits, and incomplete results. Preserve these limits in the UI and source records. Manual evidence URLs remain useful for old work. Public data rate limits are a deliberate first-rollout limit; persistent GitHub credentials, private repository access, and repository webhooks are not part of this design.

A failed sync leaves drafts, reviewed selections, and published content unchanged. If a source becomes unavailable, flag it in private review and suppress unverified new material. Do not treat a 404 as proof that the repository was deleted or made private. Existing published material remains a dated snapshot until the author removes it; explicit unpublish is available. Pausing the connection stops future checks but keeps drafts and published selections.

## Migration and release checks

1. Prepare the existing six project and six contribution stories as a migration preview for owner ID `17733`. Add the confirmed repository IDs and preserve all authored fields. Do not overwrite an existing account draft. Let the owner resolve duplicate matches and accept the import.
2. Add the new repository/activity candidates from a fresh API fetch; this inventory is a planning snapshot, not a production import file. Keep all candidates private.
3. Review and save selected work. Verify the preview contains both projects and contributions. Publish a separate owner snapshot only after the owner chooses Publish changes.
4. Check idempotent sync, partial pages, rate limits, hidden candidates, actor mismatch, renamed/transferred repositories, stale revisions, approval revocation, unsafe URLs, account isolation, old backups, and no secret/client exposure.
5. Check migration fidelity, signed-out `/mager/`, protected details, preview/public separation, unpublish without fallback resurrection, and existing links. Run `npm test`, `npm run build`, desktop/mobile checks, and main/admin regression checks before deployment.

Module names, indexes, exact request budgets, and visual spacing within DESIGN.md are builder choices. Do not expand this into rankings, commit-count scores, shared follows, email delivery, or private-source ingestion.
