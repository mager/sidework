# Sidework

A home for personal software and open source contributions.

Sidework connects three parts of a developer’s work: the projects they build, the changes they make to shared tools, and the things they want to learn next. This first prototype uses @mager’s real projects and public contribution evidence.

## Run locally

Use Node.js 22.19 or later.

```sh
npm install
npm run dev
```

- `/mager/`: shareable profile, personal projects, and six recent pull requests.
- `/`: people-first discovery with real software previews and a local saved collection.
- `/workbench/`: workbench with projects, searchable contribution history, discovery, and a four-project weekly plan.
- `npm test`: state, URL safety, contribution normalization, saved collection, and follow checks.
- `npm run build`: static production output in `dist/`.

## What works

The public studio places the maker at the center, with software previews around them. An uneven project sequence, CSS scroll timelines, native popovers, auto-height details, container queries, and cross-document view transitions support exploration. All content remains usable without motion; reduced-motion settings disable the spatial movement.

- Public project showcase with demo, source, and build-log links.
- Contribution search and status filters, with source links and dated evidence.
- Skill filters for four curated contribution opportunities.
- Saved opportunities and planned / in progress / submitted states.
- Local project drafts with safe HTTP(S) links.
- Public GitHub refresh for @mager’s repositories and recent pull requests, with loading, timeout, and rate-limit recovery.
- Markdown export of the public work record.
- Responsive layouts, keyboard navigation, and light/dark themes.

## Prototype boundaries

There is no login, multi-user backend, automatic synchronization, or connected social graph. Saves and follows in the public studio are browser-local preferences. A static workbench is not an authenticated account. Local drafts and plans use `localStorage` and are available to anyone using the same browser profile. They are not posted to GitHub or included in the public profile. Refreshed GitHub results last for the current visit; saved plans and local drafts survive reloads when browser storage is available.

The profile is a committed snapshot. Updating a local draft does not publish it. To update the profile, edit `src/data/projects.ts` or the contribution snapshot and rebuild. Source links provide the current GitHub state. All three routes use `noindex` while this remains a prototype.

The weekly goal counts distinct saved projects marked submitted by the user. It does not infer a merge or verify a submission. Opportunity availability is a dated observation; check the issue and related PRs before starting. Shiki’s example already has related work and needs coordination.

## Data and assets

- Six recent PR states were fetched from GitHub on November 4, 2026. The snapshot preserves merged, draft, open, and closed as separate states.
- Older contribution evidence comes from @mager’s October 12, 2026 [public contribution record](https://mager.co/software/contributions.json). The workbench displays a selection; it does not claim a full GitHub history or complete activity totals.
- Project descriptions and links come from [@mager’s software directory](https://mager.co/software/).
- The illustrated @mager portrait is an existing asset from magerblog, by [@hopperdraws](https://x.com/hopperdraws). It is included for this profile; it is not a reusable product logo.
- The Homeport, Mood Shell, and Perch screenshots remain on @mager’s existing Vercel Blob image host. No remote media is copied into this repository.

## Typography

Anybody gives the wordmark and project headings their narrow, rounded shapes. Hanken Grotesk handles descriptions, navigation, and controls. Martian Mono marks repository identifiers and data. Variable width and weight create a shared rhythm without using display lettering for dense reading. Text sizes use rem units. Compact source labels use the monospace face, while descriptions keep the reading face.

The three Latin WOFF2 subsets total about 112 KiB. They are self-hosted with `font-display: swap`; the interface and display fonts are preloaded. No external font request is needed. Other writing systems use the fallback stack. Sources and SIL Open Font Licenses are in `public/fonts/`.

## Next build

1. Add a GitHub App with explicit repository selection and server-side synchronization.
2. Add accounts, profile ownership, and an explicit publish workflow.
3. Let developers explain a project or contribution in their own words.
4. Add follows, project updates, and opportunity recommendations based on stated learning goals.
5. Add other source providers behind the same contribution model.

Keep project ownership separate from upstream contribution credit. Keep activity separate from learning and impact. Never rank people by raw commit counts.

## License

Code is MIT licensed. The portrait, screenshot, personal project descriptions, and third-party contribution records retain their original rights and attribution; the code license does not grant rights to reuse those assets as your own identity or work.
