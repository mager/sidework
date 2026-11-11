# MVP and V1 release plan

Reviewed November 9, 2026 against the current code. This is a release plan, not a claim that the features below are live.

## MVP: publish your work

A builder can sign in with GitHub, add a personal project or an upstream contribution, review it, and publish a profile they can share. Both kinds of work have equal weight. The interface stays small and monochrome; screenshots keep their color.

### Ready now

- GitHub sign-in, verified numeric account IDs, waiting status, and stored email consent.
- Owner-only signup dashboard with search, accessible status and consent filters, manual access changes, and Firestore audit records.
- Server-saved private account projects, featured order, and contribution drafts, with account isolation, revision conflicts, explicit browser import, and full backup restore. Legacy sessions remain browser-local. See [private account drafts](account-drafts.md).
- Account-bound project export, draft review, and MCP preparation. Review rejects other account IDs and handles account renames. The public catalog remains the @mager example.
- Compact work lists, separate detail pages, original-color imagery, and theme controls.

Priority 1, private account draft storage, is implemented. The checks below remain before the public MVP release. The owner can grant private preview access manually. This does not complete MVP or V1.

The November 11 [GitHub inventory and connected-profile design](superpowers/specs/2026-11-11-connected-github-design.md) maps @mager's existing stories and discovered public repositories to import, private review, and publishing. @mager selected review before new repositories appear publicly. The design is proposed, not implemented; its inventory is not a production import or a complete activity history.

### Required before the public MVP release

| Priority | Missing capability | Release check |
| --- | --- | --- |
| 2 | Profile preview and publishing | A builder can preview, publish, edit, and unpublish their own profile. Drafts remain private. Both projects and external contributions appear, with source links and explicit evidence states. Public URLs work while signed out. Handle changes cannot transfer ownership. |
| 3 | First-use path | A new approved account starts with its own identity and empty workspace. It can add a project and a contribution without using @mager’s data. Saving, failure, and recovery states are tested on mobile and desktop. |
| 4 | Controlled access and recovery | Verify that returning an account to waiting blocks private tools and account agent tokens while retaining drafts. Users can export all their work and request account deletion. Test restore before enabling deletion. |
| 5 | Release operations | Document data use and retention. Add error reporting without tokens or private draft text, health checks, database backup/restore checks, and tested rollback. Verify OAuth failure and expired-session recovery. |

New accounts start waiting. The configured owner controls admission to the private preview. Use test records to verify access changes. Email consent is recorded. Email delivery, unsubscribe, and consent checks remain release work.

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

Private draft tests cover separate accounts, current approval, stale and simultaneous revisions, request limits, invalid records, old tabs after an account change, two independent clients, recovery files, explicit browser import, retained browser originals, legacy storage, and same-page review changes. A real browser check read and wrote an empty account workspace through the server and downloaded its backup; it did not change authored content. Desktop/mobile review and deployment checks are recorded separately when complete.
