# Contribution stories

## Purpose and scope

Show six authored @mager stories from the software page, with selected source evidence. The exact public `/mager/` profile embeds the stories. `/contributions/`, detail pages, and `/contributions/drafts/` require invite access. Drafts remain private in this browser.

## Approved direction

Extend the established borderless monochrome system. Keep the current fonts and colors. Use short text and open space. Do not add a separate visual identity for contributions.

Rows pair name and repository with a short story in two equal columns, with a 48px gap and 32px vertical padding. At 760px, use one column, a 16px gap, and 24px vertical padding. Name @mager above the collection; do not repeat the author in each row. Use h2 story titles on the standalone index and h3 in the profile section.

Page headings reuse the existing 2rem–3rem role. Detail pages pair the authored story with its source, then list selected evidence. PR states and check dates stay visible. Commit evidence has no merge state.

The editor places form and preview in two equal columns. At 760px, the preview follows the form and is no longer sticky. Put “Private preview” below its title. State local saving and the publishing limit once above the editor.

## Evidence and boundaries

`src/data/contribution-stories.json` holds the committed stories and dated evidence. `src/components/ContributionStories.astro` renders the shared list. `src/styles/contribution-stories.css` defines these layouts. The editor accepts up to 20 local drafts and validates GitHub evidence URLs against the entered repository. A handle remains unverified. Project exports do not include contribution drafts.

Review captures are under `.impeccable/review/`, with contributions, contribution-detail, and contribution-editor prefixes. The root task owns the final desktop and mobile checks.
