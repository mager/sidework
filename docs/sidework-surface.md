# Sidework: an open studio

Routes: `/invite/` access gate, `/` discovery, `/mager/` maker profile, `/workbench/` browser-local planning tools, and `/onboarding/` public GitHub repository import. The exact `/mager/` profile and the invite page allow anonymous access. All other application routes require a valid invite session. The maker profile can be shared without an invite.

The user rejected traditional columns and regular grids and requested an elegant social network for builders, nerds, coders, and vibers, with modern CSS. This explicit direction replaces the previous dashboard-first public surface. The existing workbench behavior and dated evidence remain.

THESIS: Meet people first, with their projects around them. Discover personal software by moving through an open studio of real projects and meeting the person behind each one.

OWN-WORLD: Near-black moss ground; lime identity, soft lavender and clay secondary accents; Anybody variable display, Bricolage Grotesque reading text, Martian Mono source metadata. Use @handles for people. Real screenshots keep their original colors. Containers belong to software previews, not repeated UI cards.

STORY: Enter with an invite code. Open a project preview, learn what it does, visit it or its source, save it locally, and find its maker. Upstream work is part of the maker's record. Personal planning lives in the workbench. A GitHub handle can supply public repositories for bulk import as local project drafts. The import does not verify account ownership or publish a profile.

FIRST VIEWPORT: Large asymmetric lettering occupies the open ground. A real software window floats into that space. A compact floating navigation dock keeps discovery, saved projects, identity, and workbench within reach. The field below changes scale and alignment per project instead of repeating a regular grid. Mobile follows the same order, without overlap or required gestures.

FORM: Code-led open studio. Direction seed a8c227e1 assigned candidate 6. Grounded candidates: project atlas, unboxed timeline, software screening room, creative coding exhibition, field notebook, open studio desktop (6), generative portfolio. The user's explicit no-columns/no-regular-grid instruction pins the composition. Challenger raised discipline: exposed binding -> preserve direct sources; curved crease -> spatial continuity; PC98 -> decisive type; phosphor terminal -> useful keyboard operation; cracktro depth -> use layers and keep the reading plane still. None overrides the user's self-hosted custom type or real software imagery. No generated comp is treated as approved.

SIGNATURE: Project previews shift gently in depth with scroll, then settle on hover or focus. Shared-element navigation carries the maker's identity between discovery and profile. Native details disclose project context. Locally saved projects form a useful collection. Motion is progressive enhancement, disabled for reduced-motion users.

FINISH: The studio, invite/import/type extension, and story editor/profile-draft extension passed review. The story extension reached ship after keyboard focus was retained through feature and reorder changes. The preview is deployed at https://sidework-ten.vercel.app; the requested hostname was unavailable. Access uses reusable invite codes and seven-day sessions. Individual accounts, remote follows, and public posting remain unconnected. The design records preserve the studio world and document the implemented entry flow.

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

## Story editor and profile draft extension

The workbench keeps its compact controls while the local preview uses studio type. On desktop, the form and sticky preview share the available space; the context panel is hidden. At 960px and below, the preview follows the form. At 700px and below, the shell uses one content column. Profile drafts alternate wide and narrower project blocks on desktop and use full width on smaller screens. They do not use a repeated card grid or public preview motion.

Story fields cover the project purpose, stage, stack, optional HTTPS screenshot and description, source, reason for building, and lessons learned. Native disclosures keep optional details compact. Saving creates a local draft or a local override of a seeded project. Failed saves retain the form text and last saved state. The public profile stays unchanged.

Up to six projects can be featured and reordered with named earlier/later controls. Focus remains within the active panel after these controls update the view. The private JSON export includes selected stories in order and the prototype handle @mager; it is not a restore feature or a publishing action. GitHub imports preserve story fields and profile order.

Review passed at desktop 1440px and mobile 390px with no horizontal overflow. Evidence: .impeccable/review/editor-desktop.png, editor-mobile.png, showcase-desktop.png, and showcase-mobile.png. The recorded composer detector findings are empty.
