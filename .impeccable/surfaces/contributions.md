# Contribution stories

## Purpose and scope

Show six authored @mager stories from the software page, with selected source evidence. The exact public `/mager/` profile and Explore alternate the external stories with personal projects in one work list. `/contributions/`, detail pages, and `/contributions/drafts/` require invite access. Drafts remain private in this browser.

## Approved direction

Extend the established borderless monochrome system. Keep the current fonts and colors. Use short text and open space. Do not add a separate visual identity for contributions.

The profile and Explore give projects and contributions the same compact row layout, title size, and image space. All work alternates five projects and six external stories, starting with Cántalo and Uber Direct SDK. Use two columns on desktop and one at 760px and below. Thumbnails or contribution icons occupy 96 × 64px on desktop and 64 × 48px on mobile. Preserve source colors. Full screenshots belong on detail pages. All work, Projects, and Contributions use GET links; categories appear only under Projects. Exclude repositories owned by the story author. Add a contribution opens the private editor. Raw PR history stays in the workbench.

The separate contribution index pairs name and repository with a short story in two equal columns, with a 48px gap and 32px vertical padding. At 760px, use one column, a 16px gap, and 24px vertical padding. Name @mager above the collection; do not repeat the author in each row. Use h2 story titles on the standalone index and the combined work list.

Page headings reuse the existing 2rem–3rem role. Detail pages pair the authored story with its source, then list selected evidence. PR states and check dates stay visible. Commit evidence has no merge state.

The editor places form and preview in two equal columns. At 760px, the preview follows the form and is no longer sticky. Put “Private preview” below its title. State local saving and the publishing limit once above the editor.

## Evidence and boundaries

`src/data/contribution-stories.json` holds the committed stories and dated evidence. `src/components/ContributionStories.astro` and `src/styles/contribution-stories.css` define the separate contribution list. `Studio.astro`, `work-feed.mjs`, and `studio.css` define the combined work list. The editor accepts up to 20 local drafts and validates GitHub evidence URLs against the entered repository. A handle remains unverified. Project exports do not include contribution drafts.

Review captures are under `.impeccable/review/`, with contributions, contribution-detail, and contribution-editor prefixes. The combined work-list review passed with no material defects. Its `work-feed-*.jpg` captures cover desktop, mobile, 320px, Light mode, Contributions, detail, and Explore. All 62 tests and the production build passed, with no layout detector findings. These checks describe local validation.
