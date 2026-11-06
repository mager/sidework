# Project metadata

Projects can include four optional fields. The shared vocabulary and limits are in `src/scripts/project-metadata.mjs`. Use the stable IDs below in source records, local drafts, JSON exports, and MCP requests. Display the labels in the interface.

| Field | Value | Limit |
| --- | --- | --- |
| `category` | One purpose ID, or `""` | Use a listed category |
| `softwareType` | One delivery ID, or `""` | Use a listed software type |
| `audience` | Short text about the people or task helped | 180 characters |
| `features` | Array of concrete capabilities | Up to five strings, each with 1–160 characters |

Keep programming languages and frameworks in `stack`. Use the tagline for the main task and the description to explain the problem and how the software works.

## Stable IDs

| Category ID | Label |
| --- | --- |
| `developer-tools` | Developer tools |
| `productivity` | Productivity |
| `creative` | Creative tools |
| `learning` | Learning |
| `games` | Games & recreation |
| `utilities` | Utilities |

| Software type ID | Label |
| --- | --- |
| `web-app` | Web app |
| `cli` | Command-line tool |
| `desktop-app` | Desktop app |
| `mobile-app` | Mobile app |
| `browser-extension` | Browser extension |
| `library` | Library |
| `service` | API / service |

Add a category only when real projects need it. This version has no nested categories, rankings, or automatic classification.

## Validation and version 1 compatibility

The workspace and `sidework-profile-draft` export stay at version 1. Older records can omit all four fields. Cleaning supplies empty strings and an empty feature array. No migration is required. Blank metadata does not add empty sections to the project preview or detail page.

`validateMetadata` checks supplied IDs, field types, and lengths before an editor save or draft review. `cleanMetadata` trims text, applies limits, removes empty and duplicate features, and clears unknown classification IDs. Its cleanup also supports stored records and display. Character limits use JavaScript string length. The editor accepts one feature per line and removes blank lines before validation.

Exports retain metadata for the selected projects in order. Review accepts one to six projects in the existing private draft format; the file limit remains 64 KB. See [agents.md](agents.md) for the complete transfer and agent contract.

## Source facts and authored content

GitHub import supplies repository facts: name, description, primary language, source URL, and a safe project URL. It leaves category, software type, audience, and features blank. Imports skip existing repositories and preserve their authored stories, metadata, and featured order.

The author supplies classification and useful explanations. Agents can prepare these fields from source evidence and author input. They must leave unknown values blank and must not invent capabilities. Public records come from committed `src/data/projects.ts`; local edits remain in the current browser.

A prepared draft or exported file does not publish a project. Review requires an explicit **Save these projects** action to update local stories and featured order. No MCP action publishes or changes the committed public profile.

## Interface consistency

This extension uses the existing monochrome palette, fonts, layouts, and controls. Category links use the shared text tokens, wrap on small screens, and work without JavaScript. Their selected state uses an underline and `aria-current`. Category and software type use native selects in the existing form grid. Audience and features reuse the story fields and preview sections.

Project detail pages add the audience to the existing metadata column and features to a simple list. The project grid, screenshot treatment, theme controls, and shared navigation remain as defined in [DESIGN.md](../DESIGN.md) and [sidework-surface.md](sidework-surface.md). This extension does not add design tokens or replace those records.

The reviewer reported no material visual failures in five captures under `.impeccable/review/metadata/`. The implementation checks passed with 54 tests, the production build, and `git diff --check`. These results cover this extension and do not claim a new deployment.
