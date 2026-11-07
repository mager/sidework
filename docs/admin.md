# Sidework admin

The owner dashboard is a second Vercel project from this repository. It tracks GitHub signups, not invite codes. Open it from Settings → Admin on the main site.

- Main: https://sidework-ten.vercel.app
- Admin: https://sidework-admin-mager1s-projects.vercel.app
- Vercel project: `sidework-admin` (`prj_tLbIAtf6rOVghAeHzOP93eplP83H`)

## What it does

The dashboard shows @handles, GitHub links, email addresses, access status, email consent, signup dates, and last sign-in dates. Dates use America/Chicago. Search matches handles and email addresses; filters select status and consent. Search forms use POST so an email query does not enter the URL. Refresh and Clear return the full list.

Records come from the server-only `sidework_accounts` collection, newest first. At most 1,000 records load. If there are more, a notice states that search and counts cover the latest 1,000. The table has real loading-failure and no-match states. Mobile account rows stack vertically, with identity above a two-column grid of labeled fields.

This version does not approve accounts, generate invite codes, change consent, delete accounts, export emails, or send email. Only the configured owner is approved. Account-specific exports, review, and MCP templates must be completed before approvals open.

## Authentication

The admin deployment serves only `/`, `/admin/`, `/admin/login/`, and the exact `/auth/admin/start/`, `/auth/admin/callback/`, and `/auth/admin/signout/` endpoints. Every private request checks a separate one-hour HttpOnly, SameSite=Lax, origin-bound admin session, then reads the owner account and checks its current approval and immutable GitHub numeric ID. Missing configuration, wrong deployment origin, database errors, deleted accounts, non-owner accounts, and waiting accounts fail closed. Main-site account cookies, legacy invite cookies, and agent bearer tokens do not authorize admin access.

The login form creates a signed ten-minute flow cookie and a PKCE verifier. It opens `/admin/connect/` on the main site. That route has no account data; it checks the signed-in GitHub owner or offers the existing GitHub OAuth flow. The main site issues a 60-second handoff code, stores only its hash with the owner ID, audience, state, and PKCE challenge in `sidework_admin_handoffs`, and redirects to the fixed admin callback. The admin consumes the code in a Firestore transaction before creating a session. Incorrect browser proofs cannot consume it. Used codes are deleted; abandoned codes expire but can remain as inert records.

All admin responses are private/no-store and noindex. Callback responses use no-referrer. Ordinary pages use same-origin referrer policy so form POST origin checks work. State-changing login and logout actions check the request origin. Search POSTs also check the origin. Browser Firestore access remains denied.

## Deployment

Both Vercel projects connect to `mager/sidework` on `main`, with the Astro framework preset. Deploy both after changes to the shared authentication flow.

Main production needs `SIDEWORK_ADMIN_ORIGIN` in addition to its existing configuration. Admin production needs:

- `SIDEWORK_SITE=admin`
- `SIDEWORK_ORIGIN=https://sidework-ten.vercel.app`
- `SIDEWORK_ADMIN_ORIGIN=https://sidework-admin-mager1s-projects.vercel.app`
- A separate random `SIDEWORK_ADMIN_SESSION_SECRET` of at least 32 characters
- `SIDEWORK_OWNER_GITHUB_ID=17733`
- The existing GCP project, number, service account, and pool variables
- `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=vercel-admin`

The admin does not receive the GitHub client secret, main-site session secret, or invite hashes. Its Vercel OIDC provider checks the exact team and admin project IDs. The existing service account has an additional Workload Identity binding for the admin production subject only. Preview deployments cannot authenticate on a different origin. No service-account key exists.

The requested short `sidework-admin.vercel.app` alias was already assigned to another project; the team-qualified alias is used instead.

## Local check

Run the main app at 127.0.0.1:4345 and an isolated source copy at 127.0.0.1:4346. Use a second source directory because Astro's dev-server manager allows one server per project root. Both use the same database and a fresh local Vercel OIDC token. The local admin can use the main development provider; set local origins to those two ports and keep all environment files ignored. No authentication bypass is supported.

Run `npm test` and `npm run build`. Check owner login, logout, expired callback, status/consent/search filters, empty results, desktop and mobile. Check anonymous admin redirects and non-owner rejection without changing real users' account status.
