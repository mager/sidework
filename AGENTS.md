# Sidework

Sidework is an Astro server-rendered prototype with a public @mager profile and invite-only tools for developer profiles, personal software, upstream contributions, and opportunity discovery.

- Read README.md and DESIGN.md before UI work.
- Display people with @handles in headings, navigation, account details, and exports. Keep repository owner/name identifiers and URLs unchanged.
- Use real source evidence. Do not invent users, follower counts, stars, testimonials, merged states, or learning outcomes.
- Keep public profile snapshots separate from browser-local drafts and weekly plans.
- Project stories and featured order are browser-local. Profile draft exports are private backups, not publishing. Preserve authored fields and selected order when importing repositories.
- MCP tools may read committed records and public repositories or prepare drafts, never publish. Review links and files require an explicit browser save. Keep agent tokens separate from invite cookies; never log them. API authentication lives in agent-auth.mjs and agent-http.mjs.
- Preserve explicit draft/merged/open/closed states and check dates.
- Do not introduce GitHub tokens into browser code. Public API refresh may fail; retain the snapshot.
- Use safe HTTP(S) URLs and text nodes for user or API data.
- Run `npm test` and `npm run build` for behavioral changes. Check both mobile and desktop for UI changes.
- Vercel deployment uses @astrojs/vercel. All application routes except /invite/ and the exact /mager/ profile route require a signed server cookie, or the scoped bearer token for /api/mcp. Never bypass the gate for previews. Keep invite hashes and session secrets in server environment variables.
