# MVP and V1 release plan

Reviewed November 8, 2026 against the current code. This is a release plan, not a claim that the features below are live.

## MVP: publish your work

A builder can sign in with GitHub, add a personal project or an upstream contribution, review it, and publish a profile they can share. Both kinds of work have equal weight. The interface stays small and monochrome; screenshots keep their color.

### Ready now

- GitHub sign-in, verified numeric account IDs, waiting status, and stored email consent.
- Owner-only, read-only signup dashboard with search and accessible status/consent filters.
- Account-scoped browser drafts, project import, project stories, and contribution stories.
- Account-bound project export, draft review, and MCP preparation. Review rejects other account IDs and handles account renames. The public catalog remains the @mager example.
- Compact work lists, separate detail pages, original-color imagery, and theme controls.

### Required before opening access

| Priority | Missing capability | Release check |
| --- | --- | --- |
| 1 | Server-saved private drafts | Two test accounts cannot read or change each other’s projects or contributions. Work survives a second browser, failed writes, and concurrent edits. Existing browser drafts import only after an explicit review. |
| 2 | Profile preview and publishing | A builder can preview, publish, edit, and unpublish their own profile. Drafts remain private. Both projects and external contributions appear, with source links and explicit evidence states. Public URLs work while signed out. Handle changes cannot transfer ownership. |
| 3 | First-use path | A new approved account starts with its own identity and empty workspace. It can add a project and a contribution without using @mager’s data. Saving, failure, and recovery states are tested on mobile and desktop. |
| 4 | Controlled access and recovery | A separate, reviewed change adds approval/revocation with an audit record. Revoked access stops tools and agent tokens. Users can export all their work and request account deletion. Test restore before enabling deletion. |
| 5 | Release operations | Document data use and retention. Add error reporting without tokens or private draft text, health checks, database backup/restore checks, and tested rollback. Verify OAuth failure and expired-session recovery. |

Keep the admin read-only and other accounts waiting during this work. This change does not approve anyone, publish a profile, or send email. Consent is recorded, but email delivery is not connected. Before promising updates, add delivery, unsubscribe, and consent checks.

## V1: a reason to return

After the publishing path works with real users:

- Shared follows and saves across devices, with a small feed of published work from followed builders.
- Source refresh with explicit check dates and failure recovery. Let authors confirm changes; never infer contribution credit from commit counts.
- Better discovery by project purpose and contribution topic. Keep personal projects and upstream work together.
- Screenshot upload and image processing that preserve quality and remove browser chrome.
- Optional email updates with consent, unsubscribe, and a clear delivery record.

Defer rankings, streaks, chat, and complex recommendations. Measure whether builders finish a profile, share it, and return to add work before adding more surfaces.

## November 8 checks

The account foundation has automated tests for export/review round trips, foreign-account rejection without saved-state changes, handle changes, legacy compatibility, current MCP identity, and approval revocation. Browser checks cover filter selection, empty results, clear, keyboard focus, responsive layouts, the account import default, and project review. These checks do not replace the missing multi-user publishing tests above.
