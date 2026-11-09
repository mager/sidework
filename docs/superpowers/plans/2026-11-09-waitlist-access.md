# Waitlist and owner access

User request: improve signed-out signup, keep returning users signed in, and let the owner admit waiting accounts from the separate admin site. This explicitly replaces the read-only admin restriction. Do not approve a real account during implementation.

## Scope

The user confirmed GitHub signup and persistent sign-in. New signups wait; a return visit shows status without another OAuth flow while the session remains valid. Use a 30-day account session, renewed after half its lifetime following a successful database identity check. Keep the separate admin session, owner check, and PKCE handoff. Admin sessions last eight hours and renew after half their lifetime. Do not promise email delivery or a queue position that has not been measured.

## Tasks

- [x] Add owner-only approve and return-to-waiting actions. Require same-origin POST, bounded forms, numeric target IDs, an expected status, current owner approval inside a transaction, and atomic audit records. Never change owner access. Reject stale actions. Keep approvals off the main deployment.
- [x] Improve signup and waiting pages with brief copy, a clear action, persistent account state, and Check access. Keep optional email preferences secondary. Show admin actions next to each account with an explicit confirmation step for returning an account to waiting.
- [x] Test access decisions, stale actions, revoked sessions and agent tokens, session renewal, and isolation. Obtain independent security review. Check mobile and desktop.
- [x] Update current operating documents and run tests/build.
- Deployment follow-through: push main and verify both production sites. No real-account approval is part of verification.

## Decisions

The waiting list is a pending access state, not a promised first-in-first-out rank. Admin admits each account manually. Approval grants private tools, not profile publishing. Public snapshots and private account drafts stay separate. Deletion and email sending are outside this change.

## Verification

124 tests and the production build pass. An independent security review found no blocking defect. The same-cookie regression covers approved → waiting → approved access. Browser checks cover signup and owner admin at 1440 px and 390 px, including the real PKCE owner transfer and return to admin without GitHub. No real account access status was changed. Approval transactions and audit atomicity were checked with a database test double.
