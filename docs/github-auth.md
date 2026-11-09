# GitHub sign-in and waitlist

GitHub OAuth and Firestore are live at [Sidework](https://sidework-ten.vercel.app). Production sign-in, account storage, waiting access, consent changes, and sign-out were checked. No email delivery is connected.

## Current setup

GitHub OAuth app `3998242` is registered under @mager. Its secret is configured locally and in Vercel production. The homepage is `https://sidework-ten.vercel.app`. Registered callbacks are:

- Production: `https://sidework-ten.vercel.app/auth/github/callback/`
- Local: `http://127.0.0.1:4345/auth/github/callback/`

Firebase/GCP project `sidework-9da9c` uses the `(default)` Firestore database in `us-east4`, Standard edition, with the free tier and billing disabled. The server uses Vercel OIDC Workload Identity through pool `sidework-vercel` and provider `vercel`. Trust is limited to the Sidework project and team by immutable IDs, with production and development environments allowed. Preview is not allowed. The service account `sidework-accounts@sidework-9da9c.iam.gserviceaccount.com` has `roles/datastore.user`. No GCP service account keys are used. Provider and service account policy readback confirmed the project/team conditions and only the Sidework production/development principals.

`firestore.rules` denies all browser reads and writes. These rules were deployed with the Firebase CLI. Server access uses IAM. There is no SQL schema migration; transactions create documents as needed. Private account drafts use `sidework_drafts/<numeric-id>`. The `drafts` field has an applied Firestore index exemption, tracked in `firestore.indexes.json`; nested private draft data does not need indexes. The earlier free Neon database is empty and unused by the new code. It is disconnected from Sidework, and its Vercel variables were removed. It has not been deleted.

## Environment and local use

Use the values in `.env.example`. Keep secrets and tokens in server environment variables, outside Git, client code, and logs.

| Variable | Value or purpose |
| --- | --- |
| `GITHUB_CLIENT_ID` | OAuth app client ID. |
| `GITHUB_CLIENT_SECRET` | OAuth app secret; server only. |
| `SIDEWORK_ORIGIN` | `https://sidework-ten.vercel.app` in production; `http://127.0.0.1:4345` locally. |
| `SIDEWORK_OWNER_GITHUB_ID` | `17733`, the verified numeric ID for @mager. |
| `SIDEWORK_SESSION_SECRET` | Retain the existing secret, at least 32 characters. Rotation invalidates all signed sessions and tokens. |
| `SIDEWORK_INVITE_HASHES` | Retain existing hashes while legacy sessions and version 1 agent tokens must remain valid. |
| `GCP_PROJECT_ID` | `sidework-9da9c` |
| `GCP_PROJECT_NUMBER` | `785479297193` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `sidework-accounts@sidework-9da9c.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_POOL_ID` | `sidework-vercel` |
| `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` | `vercel` |
| `VERCEL_OIDC_TOKEN` | Local only: a fresh, short-lived token from `vercel env pull`. Never commit it. |

Vercel supplies OIDC tokens at runtime in production. For local work, use `vercel env pull` to obtain a fresh development token and load it with the local server environment. Retain the local origin above. An expired token requires a fresh pull; do not replace it with a service account key. Start Astro on port 4345:

```sh
npm run dev -- --host 127.0.0.1 --port 4345
```

`DATABASE_URL` is no longer used. HTTP origins are accepted only for `localhost` and `127.0.0.1`. Keep origin, callback, and Workload Identity conditions consistent; never bypass the access check for a preview.

## Identity and access

GitHub sign-in requests `user:email`, reads the GitHub numeric ID and login, and requires a verified email. It chooses the primary verified email when available. The provider token is used during sign-in only; it is not stored or returned to the browser.

OAuth state and PKCE use a signed, HTTP-only, same-site cookie that expires after 10 minutes. The account cookie is signed, bound to the site origin, HTTP-only, and valid for 30 days. After 15 days, a request renews a valid cookie when the server verifies the current account in Firestore. An expired cookie requires sign-in. Cookies use Secure on HTTPS. Form submissions check the request origin.

The Firestore `sidework_accounts` collection uses the numeric GitHub ID as each document ID. It stores ID, login, email, `waiting` or `approved` status, email update consent, and creation, login, and consent-change dates. A new record for the configured owner starts approved. Other new records start waiting. A Firestore transaction creates the record or refreshes identity and login time without replacing status or consent. Consent can be changed on the waiting page or in Settings. It does not send email.

The configured owner grants access from the separate admin dashboard. Approval grants private tools. Private exports, draft review, and MCP templates use the verified account ID and current @handle. A signed-in visitor can use Check access to open the Workbench after approval without signing in again. Public multi-profile publishing is a separate release requirement. [Admin setup](admin.md) and [MVP checklist](mvp.md).

| Route | Access |
| --- | --- |
| `/signup/`, exact `/auth/github/` and `/auth/github/callback/` | Public entry and OAuth routes. |
| Exact `/mager/` | Public committed profile; remains available during account database failure. |
| `/invite/` | Public redirect to signup; invite codes no longer create sessions. |
| `/api/signout` | Public POST with an origin check; clears account, OAuth, and legacy invite cookies. |
| `/waiting/`, `/api/account/updates` | Signed-in waiting accounts may check status and save consent. The waiting page redirects approved accounts to the Workbench. |
| `/api/account/drafts` | Approved account session and matching `X-Sidework-Account` header; GET or same-origin JSON PUT. Legacy cookies and agent tokens do not grant access. |
| Other application routes | Approved account session or valid legacy invite cookie. |
| `/api/mcp` | Separate scoped bearer token; browser cookies do not authorize MCP. |

Account approval is read from Firestore for protected browser requests. A waiting account cannot use an old invite cookie to bypass its status. Database failure closes account access. The exact public profile remains available.

Existing legacy cookies and version 1 agent tokens remain valid until expiry or invitation-hash revocation. Account-based version 2 agent tokens last up to 24 hours, never longer than their account session. They recheck account approval in the database on every MCP request. Both token versions retain the existing scopes and origin binding.

## Local work and checks

Account browser data uses `:github:<numeric-id>` storage suffixes for retained browser drafts, plans, saves, follows, and reset backups. Current project stories, featured order, and contribution drafts save through `/api/account/drafts` to server-only Firestore. The server derives the document ID from the approved session and rechecks approval in each transaction. Writes compare revisions and reject conflicts. Existing browser drafts require explicit review and import; Settings reset does not delete account drafts. Legacy data remains in its original keys; no automatic migration occurs. See [private account drafts](account-drafts.md) for request limits, backup restore, and recovery. The theme stays browser-global. Sign-out retains local data. Browser storage is not server storage or a privacy boundary against someone with access to the browser profile.

The November 6 account-foundation validation record had 75 passing tests and a production build. Real GitHub sign-in verified owner @mager (ID 17733). With that account temporarily set to waiting, Workbench and Settings redirected to the waiting page. Unchecked consent was saved, sign-out worked, and repeat OAuth preserved waiting status. Owner approval was restored and Friends was verified.

Ready signup and waiting pages were captured at 390 × 844 and 1280 × 900. Files are `.impeccable/review/github-signup-ready-{mobile,desktop}.jpg` and `.impeccable/review/github-waiting-{mobile,desktop}.jpg`.

## Production record — November 6, 2026

Main commit `9a2b93cf085e8a140bff085f54a645c7857c6341` deployed with Ready status at [the deployment URL](https://sidework-c8bgkhfjc-mager1s-projects.vercel.app), aliased to [Sidework](https://sidework-ten.vercel.app). [GitHub CI run 42242671941](https://github.com/mager/sidework/actions/runs/42242671941) succeeded.

Real production GitHub sign-in returned the owner to Friends and verified server access to Firestore. With the owner temporarily waiting, Workbench redirected to the waiting page. Unchecked consent was saved, sign-out returned to signup, and repeat GitHub sign-in retained waiting status. Owner approval was restored and Friends was verified. Live mobile captures are `.impeccable/review/github-waiting-live-mobile.jpg` and `.impeccable/review/github-owner-live-mobile.jpg`.

HTTP checks returned 200 for anonymous signup and the public profile, 303 to signup for anonymous Friends and the old invite route, and 403 for a cross-origin OAuth start. A cancellation callback with valid server-issued state and its cookie redirected to `/signup/?error=cancelled` without an account cookie. This was an HTTP callback check, not a full GitHub UI cancellation test.

Run `npm test` and `npm run build` for behavioral changes. Use test records to verify manual access changes.
