# Sidework

Sidework is an Astro server-rendered prototype with a public @mager profile and approval-only tools for developer profiles, personal software, upstream contributions, and opportunity discovery.

- Read README.md and DESIGN.md before UI work.
- Display people with @handles in headings, navigation, account details, and exports. Keep repository owner/name identifiers and URLs unchanged.
- Use real source evidence. Do not invent users, follower counts, stars, testimonials, merged states, or learning outcomes.
- Keep public profile snapshots separate from browser-local drafts and weekly plans. Use GitHub numeric ID storage keys for account workspaces. Retain legacy browser data without automatic migration; theme stays browser-global.
- Account records use the server-only Firestore `sidework_accounts` collection, keyed by GitHub numeric ID. Use Vercel OIDC Workload Identity; do not create GCP service account keys. Keep browser Firestore access denied.
- Only the configured owner may start approved. Do not approve other accounts until private exports, draft review, and MCP templates support their identity; these still use @mager. Waitlist signup does not publish a profile or send email.
- Project stories and featured order are browser-local. Profile draft exports are private backups, not publishing. Preserve authored fields and selected order when importing repositories.
- MCP tools may read committed records and public repositories or prepare drafts, never publish. Review links and files require an explicit browser save. Keep agent tokens separate from account and legacy invite cookies; never log them. API authentication lives in agent-auth.mjs and agent-http.mjs.
- Preserve explicit draft/merged/open/closed states and check dates.
- Do not introduce GitHub tokens into browser code. Public API refresh may fail; retain the snapshot.
- Use safe HTTP(S) URLs and text nodes for user or API data.
- Run `npm test` and `npm run build` for behavioral changes. Check both mobile and desktop for UI changes.
- Vercel deployment uses @astrojs/vercel. Public application routes are /signup/, the exact /auth/github/ start and /auth/github/callback/ routes, the exact /mager/ profile, /invite/ (redirect only), and /api/signout. Waiting accounts may use /waiting/ and /api/account/updates but cannot enter the tools. Other application routes require an approved account session or a valid legacy invite cookie; /api/mcp requires its own scoped bearer token. Recheck account approval for account tokens on each MCP request. Never bypass the gate for previews. Keep OAuth secrets, database credentials, invite hashes, and session secrets in server environment variables.
