# GitHub sign-in and waitlist

This change adds GitHub OAuth signup and a Neon account record. The GitHub app and database are not yet configured. User approval is pending for OAuth app registration and acceptance of Neon/Vercel terms. This change is not deployed, and no email delivery is connected.

## Setup

1. Register the GitHub OAuth app after approval. Use `https://sidework-ten.vercel.app` as the homepage and `https://sidework-ten.vercel.app/auth/github/callback/` as the callback URL.
2. Create the Neon database after the required approval. Set the following server environment variables in local `.env` and the intended Vercel environment. Keep secrets out of Git, client code, and logs.

| Variable | Value or purpose |
| --- | --- |
| `GITHUB_CLIENT_ID` | OAuth app client ID. |
| `GITHUB_CLIENT_SECRET` | OAuth app secret; server only. |
| `DATABASE_URL` | Neon PostgreSQL connection string; server only. |
| `SIDEWORK_ORIGIN` | Exact site origin, `https://sidework-ten.vercel.app` for production. |
| `SIDEWORK_OWNER_GITHUB_ID` | `17733`, the verified numeric ID for @mager. |
| `SIDEWORK_SESSION_SECRET` | Retain the existing secret, at least 32 characters. Rotation invalidates all signed sessions and tokens. |
| `SIDEWORK_INVITE_HASHES` | Retain existing hashes while legacy sessions and version 1 agent tokens must remain valid. |

3. Create the account table with the configured connection:

```sh
node --env-file=.env scripts/migrate-accounts.mjs
```

The migration creates `sidework_accounts` if absent. For local OAuth tests, use an OAuth app callback at the local origin and set `SIDEWORK_ORIGIN` to the same origin. HTTP is accepted only for `localhost` and `127.0.0.1`. Configure each preview with its actual origin and matching callback; never bypass the access check.

## Identity and access

GitHub sign-in requests `user:email`, reads the GitHub numeric ID and login, and requires a verified email. It chooses the primary verified email when available. The provider token is used during sign-in only; it is not stored or returned to the browser.

OAuth state and PKCE use a signed, HTTP-only, same-site cookie that expires after 10 minutes. The account cookie is signed, bound to the site origin, HTTP-only, and valid for seven days. Cookies use Secure on HTTPS. Form submissions check the request origin.

The account table stores ID, login, email, `waiting` or `approved` status, email update consent, and creation, login, and consent-change dates. A new record for the configured owner starts approved. Other new records start waiting. Repeat sign-in refreshes identity and login time without replacing status or consent. Consent can be changed on the waiting page or in Settings. It does not send email.

**Do not approve other accounts yet.** Private exports, draft review, and MCP templates still use @mager. These flows must support the correct identity before other accounts receive tool access. Waitlist records can be collected after setup; public multi-profile publishing is not connected.

| Route | Access |
| --- | --- |
| `/signup/`, exact `/auth/github/` and `/auth/github/callback/` | Public entry and OAuth routes. |
| Exact `/mager/` | Public committed profile; remains available during account database failure. |
| `/invite/` | Public redirect to signup; invite codes no longer create sessions. |
| `/api/signout` | Public POST with an origin check; clears account, OAuth, and legacy invite cookies. |
| `/waiting/`, `/api/account/updates` | Signed-in waiting accounts may view status and save consent. |
| Other application routes | Approved account session or valid legacy invite cookie. |
| `/api/mcp` | Separate scoped bearer token; browser cookies do not authorize MCP. |

Account approval is read from Neon for protected browser requests. A waiting account cannot use an old invite cookie to bypass its status. Database failure closes account access. The exact public profile remains available.

Existing legacy cookies and version 1 agent tokens remain valid until expiry or invitation-hash revocation. Account-based version 2 agent tokens last up to 24 hours, never longer than their account session. They recheck account approval in the database on every MCP request. Both token versions retain the existing scopes and origin binding.

## Local work and checks

Account workspaces use `:github:<numeric-id>` storage suffixes for drafts, plans, saves, follows, and reset backups. Legacy data remains in its original keys; no automatic migration occurs. The theme stays browser-global. Sign-out retains local data. Browser storage is not server storage or a privacy boundary against someone with access to the browser profile.

Run `npm test` and `npm run build`. After setup, verify OAuth cancellation, expiry, verified email handling, owner access, waiting access, consent changes, sign-out, database failure, and rejection of waiting accounts by protected pages and MCP. Check the actual waiting page on mobile and desktop. Only the signup unavailable state has been captured so far. Complete these integration and browser checks before deployment; do not treat waitlist setup as approval to admit other accounts.
