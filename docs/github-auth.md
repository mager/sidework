# GitHub sign-in and waitlist

GitHub OAuth and Firestore are configured, and local sign-in has been checked. Production deployment, production OAuth, and the cancellation check remain pending. No email delivery is connected.

## Current setup

GitHub OAuth app `3998242` is registered under @mager. Its secret is configured locally and in Vercel production. The homepage is `https://sidework-ten.vercel.app`. Registered callbacks are:

- Production: `https://sidework-ten.vercel.app/auth/github/callback/`
- Local: `http://127.0.0.1:4345/auth/github/callback/`

Firebase/GCP project `sidework-9da9c` uses the `(default)` Firestore database in `us-east4`, Standard edition, with the free tier and billing disabled. The server uses Vercel OIDC Workload Identity through pool `sidework-vercel` and provider `vercel`. Trust is limited to the Sidework project and team by immutable IDs, with production and development environments allowed. Preview is not allowed. The service account `sidework-accounts@sidework-9da9c.iam.gserviceaccount.com` has `roles/datastore.user`. No GCP service account keys are used.

`firestore.rules` denies all browser reads and writes. These rules were deployed with the Firebase CLI. Server access uses IAM. There is no SQL schema migration; the account transaction creates documents as needed. The earlier free Neon database is empty and unused by the new code. It is disconnected from Sidework, and its Vercel variables were removed. It has not been deleted.

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

OAuth state and PKCE use a signed, HTTP-only, same-site cookie that expires after 10 minutes. The account cookie is signed, bound to the site origin, HTTP-only, and valid for seven days. Cookies use Secure on HTTPS. Form submissions check the request origin.

The Firestore `sidework_accounts` collection uses the numeric GitHub ID as each document ID. It stores ID, login, email, `waiting` or `approved` status, email update consent, and creation, login, and consent-change dates. A new record for the configured owner starts approved. Other new records start waiting. A Firestore transaction creates the record or refreshes identity and login time without replacing status or consent. Consent can be changed on the waiting page or in Settings. It does not send email.

**Do not approve other accounts yet.** Private exports, draft review, and MCP templates still use @mager. These flows must support the correct identity before other accounts receive tool access. Waitlist signup can collect records after deployment; public multi-profile publishing is not connected.

| Route | Access |
| --- | --- |
| `/signup/`, exact `/auth/github/` and `/auth/github/callback/` | Public entry and OAuth routes. |
| Exact `/mager/` | Public committed profile; remains available during account database failure. |
| `/invite/` | Public redirect to signup; invite codes no longer create sessions. |
| `/api/signout` | Public POST with an origin check; clears account, OAuth, and legacy invite cookies. |
| `/waiting/`, `/api/account/updates` | Signed-in waiting accounts may view status and save consent. |
| Other application routes | Approved account session or valid legacy invite cookie. |
| `/api/mcp` | Separate scoped bearer token; browser cookies do not authorize MCP. |

Account approval is read from Firestore for protected browser requests. A waiting account cannot use an old invite cookie to bypass its status. Database failure closes account access. The exact public profile remains available.

Existing legacy cookies and version 1 agent tokens remain valid until expiry or invitation-hash revocation. Account-based version 2 agent tokens last up to 24 hours, never longer than their account session. They recheck account approval in the database on every MCP request. Both token versions retain the existing scopes and origin binding.

## Local work and checks

Account workspaces use `:github:<numeric-id>` storage suffixes for drafts, plans, saves, follows, and reset backups. Legacy data remains in its original keys; no automatic migration occurs. The theme stays browser-global. Sign-out retains local data. Browser storage is not server storage or a privacy boundary against someone with access to the browser profile.

The local validation record has 75 passing tests and a production build. Real GitHub sign-in verified owner @mager (ID 17733). With that account temporarily set to waiting, Workbench and Settings redirected to the waiting page. Unchecked consent was saved, sign-out worked, and repeat OAuth preserved waiting status. Owner approval was restored and Friends was verified.

Ready signup and waiting pages were captured at 390 × 844 and 1280 × 900. Files are `.impeccable/review/github-signup-ready-{mobile,desktop}.jpg` and `.impeccable/review/github-waiting-{mobile,desktop}.jpg`.

Production deployment, production OAuth, and the cancellation check remain pending. Run `npm test` and `npm run build` for behavioral changes. Do not treat successful signup as approval to admit other accounts.
