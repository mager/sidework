# Sidework: an open studio

Routes: `/invite/` access gate, `/` discovery, `/mager/` maker profile, `/workbench/` browser-local planning tools, and `/onboarding/` public GitHub repository import. All application routes except the invite page require a valid invite session. “Public” below describes the studio presentation and source data, not anonymous access.

The user rejected traditional columns and regular grids and requested an elegant social network for builders, nerds, coders, and vibers, with modern CSS. This explicit direction replaces the previous dashboard-first public surface. The existing workbench behavior and dated evidence remain.

THESIS: Meet people first, with their projects around them. Discover personal software by moving through an open studio of real projects and meeting the person behind each one.

OWN-WORLD: Near-black moss ground; lime identity, soft lavender and clay secondary accents; Anybody variable display, Bricolage Grotesque reading text, Martian Mono source metadata. Use @handles for people. Real screenshots keep their original colors. Containers belong to software previews, not repeated UI cards.

STORY: Enter with an invite code. Open a project preview, learn what it does, visit it or its source, save it locally, and find its maker. Upstream work is part of the maker's record. Personal planning lives in the workbench. A GitHub handle can supply public repositories for bulk import as local project drafts. The import does not verify account ownership or publish a profile.

FIRST VIEWPORT: Large asymmetric lettering occupies the open ground. A real software window floats into that space. A compact floating navigation dock keeps discovery, saved projects, identity, and workbench within reach. The field below changes scale and alignment per project instead of repeating a regular grid. Mobile follows the same order, without overlap or required gestures.

FORM: Code-led open studio. Direction seed a8c227e1 assigned candidate 6. Grounded candidates: project atlas, unboxed timeline, software screening room, creative coding exhibition, field notebook, open studio desktop (6), generative portfolio. The user's explicit no-columns/no-regular-grid instruction pins the composition. Challenger raised discipline: exposed binding -> preserve direct sources; curved crease -> spatial continuity; PC98 -> decisive type; phosphor terminal -> useful keyboard operation; cracktro depth -> use layers and keep the reading plane still. None overrides the user's self-hosted custom type or real software imagery. No generated comp is treated as approved.

SIGNATURE: Project previews shift gently in depth with scroll, then settle on hover or focus. Shared-element navigation carries the maker's identity between discovery and profile. Native details disclose project context. Locally saved projects form a useful collection. Motion is progressive enhancement, disabled for reduced-motion users.

FINISH: The studio and invite/import/type extension passed review. The preview is deployed at https://sidework-ten.vercel.app; the requested hostname was unavailable. Access uses reusable invite codes and seven-day sessions. Individual accounts, remote follows, and public posting remain unconnected. The design records preserve the studio world and document the implemented entry flow.

## Content and provenance

- Personal software and screenshot URLs come from magerblog project posts. Screenshots are historical previews, not embedded live app sessions.
- Six recent PR records were read from GitHub on November 4, 2026; older records retain their prior dates.
- The portrait is the existing @hopperdraws illustration for @mager.
- The prototype starts with one real maker. Do not invent people, reactions, followers, ratings, or messages.
- Saved projects, draft edits, and plans stay in localStorage. Public profile data is committed source content.

## Invite and import extension

The entry pages retain the moss, lime, and open type system. Anybody carries the openings. Bricolage Grotesque gives reading text a more distinctive character, with automatic optical sizing and light tracking. Martian Mono stays limited to source metadata. Every main footer carries “Built with Astra”.

The invite form is centered, with one code field and a contact link to @mager. The import flow is left aligned and wider: a handle form, loading status, search and source filters, unboxed checkbox rows, and a sticky selection action. On mobile the import controls wrap and the primary form action takes full width. These focused flows support the studio without changing it into a dashboard.

GitHub results include owned public forks and archived repositories unless filtered out. Select matching includes results beyond the visible rows. Imports exclude existing projects and save selected repositories as drafts in this browser. No public publishing or shared account record is implied. Lock Sidework removes access but keeps browser-local drafts.
