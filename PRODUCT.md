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

Export draft downloads a private JSON copy of only the selected projects and stories in order. Its prototype handle remains @mager. It excludes unselected projects and plans. There is no restore flow, public publishing action, or account-specific profile service.

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

The user requested distinctive carefully tuned fonts, @handles for all personal identity, and a futuristic public experience without traditional columns or regular grids. Discovery and the maker profile should feel like an open studio of real software. The workbench remains a supporting tool.

The user confirmed people-first discovery, with their projects around them. The first public scene introduces @mager and surrounds that identity with real project previews.

The body font is the self-hosted variable Bricolage Grotesque, paired with Anybody display type and Martian Mono source metadata. All main surfaces carry the footer credit “Built with Astra”.
