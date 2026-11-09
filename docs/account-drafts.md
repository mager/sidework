# Private account drafts

Approved accounts save project stories, featured order, and contribution drafts on the server. A second browser loads the saved work after sign-in. Saving does not publish a profile or change the committed public @mager snapshot. Accounts start waiting until the configured owner grants access. Returning an account to waiting preserves its saved drafts and blocks private tool access.

## What saves where

| Data | Storage |
| --- | --- |
| Account projects, featured order, contribution drafts | Server-only Firestore `sidework_drafts/<verified-numeric-GitHub-ID>` |
| Account identity, approval, and email consent | Separate server-only `sidework_accounts` record |
| Plans, saved projects, follows, and reset copy | This browser, with a GitHub numeric ID suffix for accounts |
| Theme | This browser, shared between accounts |
| Existing browser drafts | Original browser key; account import requires explicit review and save |
| Legacy-session drafts | This browser; no automatic import into an account |
| Public profile | Committed source snapshot |

The account editor, repository import, contribution editor, featured controls, and profile draft review use the same account storage. They load account drafts before editing. An initial load failure does not use an old browser draft in place of server data. Sign-out does not delete drafts.

## Save and access rules

`GET /api/account/drafts` returns `revision`, `updatedAt`, and `drafts`. A new account has revision 0 and empty arrays. `PUT` accepts only `revision` and `drafts`; `drafts` contains only `projects`, `showcase`, and `contributionDrafts`.

The server derives the document ID from the approved account session. Both methods require `X-Sidework-Account` to match that ID. This check stops an old tab from using another account after a sign-in change. The header cannot select a different owner. PUT also requires a matching request origin and JSON content. Legacy cookies and agent tokens cannot authorize this API.

The Firestore transaction reads the current account and draft record. It verifies the numeric ID and approval before reading or saving drafts. A write succeeds only when its revision matches the saved revision. It then increases the revision by one. A stale write returns 409 and cannot replace newer work. Database errors fail closed. Responses use `private, no-store`.

Limits are 5,000 projects, 20 contribution drafts, six featured projects, and 700,000 UTF-8 bytes. The API checks streamed request size even if Content-Length is missing or false. Validation rejects unknown fields, malformed records, duplicate IDs or project sources, unsafe URLs, and featured IDs that do not refer to saved projects. It does not silently remove invalid records. Existing text, metadata, and URL limits still apply.

## Browser draft import

Open **Backups → Review browser drafts**. The review uses the current account's browser key. It does not search unscoped legacy keys. No import runs automatically.

The review keeps saved account fields when project IDs or source URLs match. Saved contribution IDs and featured order also take priority. New browser records are added; imported featured entries follow saved entries, up to six. Selected seeded examples are copied into private project records when needed. This preserves older browser version 1 workspaces that did not have `includeExamples`.

Choose **Save to my account** to save the reviewed result. Cancel leaves saved state unchanged. The original browser data remains unchanged after import. A save on the same page invalidates an older review and requires a new review. A change in another browser is stopped by the server revision check.

## Downloads and restore

| Action | Contents and effect |
| --- | --- |
| **Profile draft → Export draft** | Selected project stories in order; no contribution drafts or plans. The existing version 1/version 2 profile format remains supported for its permitted owner. |
| **Backups → Download account drafts** | All account projects, contribution drafts, and featured order loaded by this page. It does not fetch changes made elsewhere after the page loaded. |
| **Download last save attempt** | A private recovery copy of the last failed save. Later form edits are not included; press Save again to update this copy. |
| **Backups → Review a backup** | Validates a full account backup and shows a review before restore. |

Full account downloads use `sidework-account-drafts.json`, with format `sidework-account-drafts`, version 1, numeric `githubId`, current `handle`, and draft data. The numeric ID must match the signed-in account; a handle change does not transfer ownership.

**Download the current account drafts before a full restore.** Full restore replaces all private projects, contribution drafts, and featured order. The review shows current counts and the replacement list. Nothing saves until **Restore this backup** is selected. Plans, follows, saves, theme, browser originals, and the public profile are outside the restore.

The older profile draft review has a smaller scope: it updates matching projects and selected order while keeping unrelated projects and contribution drafts. Do not confuse that action with full account restore.

## Failed saves and conflicts

Failed saves retain the form and offer a recovery download when validated draft data is available. A conflict does not merge changes silently. Download the last save attempt, reload the saved account state, then review the changes before saving again.

A network failure can leave the result unknown: the server might have saved before the response was lost. Download the recovery copy before reloading. A pending save or recovery copy also triggers a warning before leaving the page. Loading and saving disable the active editor to prevent overlapping writes.

Settings **Reset my workspace** and **Restore previous workspace** change browser data only. They do not delete or restore server account drafts. Reset can remove old browser drafts, so export or review those drafts first if needed.

## Operations and limits

Firestore uses the existing Vercel OIDC Workload Identity connection. No service account key is needed. `firestore.rules` continues to deny all browser reads and writes. Server access uses IAM. `firestore.indexes.json` records the applied exemption from indexing the `sidework_drafts` collection's `drafts` field.

MCP tools still read committed records and public repositories or prepare drafts. They cannot read private server drafts, write them, or publish. Review links and files require an explicit browser save. The separate owner dashboard manages access. Account deletion, public publishing, and email delivery are unavailable.

Automated checks cover account isolation, approval changes, request validation, concurrent saves, old-tab account changes, two independent clients, explicit import, recovery, and retained legacy storage. Run `npm test` and `npm run build` for changes. Check mobile and desktop. Keep production deployment checks separate from local test results.
