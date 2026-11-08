# Private account drafts implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task by task.

**Goal:** Save private project stories, featured order, and contribution stories to the signed-in account across browsers, without automatic migration or lost concurrent edits.

**Architecture:** Keep the existing Astro server and keyless Firestore connection. A server-only `sidework_drafts/<GitHub numeric ID>` record stores validated draft data and a revision. The API derives ownership from the approved account session, rechecks approval in the database transaction, and rejects stale writes. Editors load this state before use and keep failed changes in the form. Existing account-scoped browser drafts remain intact and require an explicit review and import. Legacy sessions remain local.

**Tech stack:** Astro, TypeScript/JavaScript, Firestore transactions, Node test runner, existing browser controls.

**Spec:** docs/mvp.md, priority 1. The user asked to proceed with the stated next step. Publishing and account approvals remain a later release.

## Constraints

- No public publishing, approval, deletion, email, new credentials, or browser Firestore access.
- Server state contains projects, showcase order, and contribution drafts only; plans, follows, saves, and theme remain local.
- Account identity comes from the server session. Client-supplied ownership fields are rejected. The expected-account header must match the server session; it cannot select a different owner.
- Retain browser data. No migration of unscoped legacy storage into a signed-in account.
- Reject malformed data and oversized workspaces; never silently drop records.
- Keep current fonts, neutral colors, and short UI text. Check mobile and desktop.

## Tasks

- [x] Write and run failing tests for strict draft validation, account isolation, approval checks, atomic revision conflicts, request size, and origin checks.
- [x] Implement validation, Firestore store, and protected GET/PUT account draft API.
- [x] Add a shared browser adapter with initial load, versioned save, retained failed changes, and private recovery export.
- [x] Connect project edit/remove/order/review, repository import, and contribution editing to the adapter. Keep plans and legacy sessions local.
- [x] Add a compact storage status and explicit browser-draft review/import. Keep local reset/restore distinct from account drafts.
- [x] Test two independent clients, conflicts, write failures, private recovery files, imports, legacy behavior, and same-page review changes with automated checks.
- [x] Complete mobile and desktop browser review without publishing or changing account approval.
- [x] Update product and operating documents.
- [x] Run final tests and build, obtain independent code review, push main, and verify both deployments.

## Release checks

Two test identities cannot read or overwrite each other. A second client reads saved project and contribution data. An old revision receives a conflict and cannot erase the newer save. Network and storage errors leave editable text and a recovery download. Import preserves server-authored fields and featured order, and browser data remains unchanged. Existing gates, MCP limits, and read-only admin stay intact.

## Verification

- 111 automated tests passed.
- Independent backend and frontend reviews completed; findings were fixed.
- Mobile (390 px) and desktop (1440 px) browser checks passed in light and dark themes.
- The live Firestore connection loaded and saved an empty private workspace through the local app. A second editor loaded the same account state.
- The Firestore draft-field index exemption is active.
- Release `ab7638f` passed GitHub CI and reached Ready on both Vercel production sites. The main-site editor loaded private account data. Signed-out draft API requests returned 401; the admin deployment returned 404 for that API and redirected signed-out dashboard requests to admin login.
