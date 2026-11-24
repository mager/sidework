# First project, gallery, sharing, and agent stories

> **For agentic workers:** Use the parallel-agent workflow for the independent surfaces below; integrate and verify the full journey before completion.

**Goal:** Turn an approved builder's public repository into one reviewed, shareable showcase with a clear first-use path, a visual gallery, and agent-assisted storytelling.

**Architecture:** Extend the existing Astro pages and account draft/revision APIs. Keep the public projection in `sidework_showcases` and all agent output in the existing explicit draft review flow. Retain the exact public route gate; share image requests use the existing public showcase URL with `?image=share`.

**Tech stack:** Astro SSR, Vercel, Firestore server SDK, TypeScript, Node tests and jsdom. Use `@vercel/og` to render published text into a 1200×630 PNG without fetching author-supplied URLs.

**Scope authorization:** The builder approved roadmap items 1–4 and asked to proceed. Implementation choices below are agent decisions within those directions.

## Constraints

- Publish only one reviewed project and selected favorites; Explore requires explicit consent.
- Never serve private draft content through public pages, metadata, or images.
- Keep numeric GitHub account identity, current approval, same-origin writes, and revision checks.
- Agents prepare drafts and review links only. Saving and publishing each require an explicit browser action.
- Use actual screenshots and source evidence, @handles, neutral interface colors, open layouts, reduced-motion support, and safe text/URLs.
- Screenshot entry uses the existing public HTTPS image field; do not add a storage service or require new infrastructure.

## Tasks

- [x] First-project journey: approved sign-in opens Workbench; empty state offers a deliberate one-repository path or manual story. Import carries the saved project ID into the composer. Visible story/screenshot steps lead to Save and review, and a successful account save opens that exact showcase preview. Preserve errors, unsaved text, legacy behavior, and agent review fragments.
- [x] Gallery and sharing: display real screenshots, project purpose, and @handles from listed published snapshots. Add restrained publication success, copy/native share with fallback, and public metadata with a project-specific image. Unpublished/unavailable pages and images return 404/503.
- [x] Agent story workflow: add a focused MCP prompt, copyable browser prompt, and plugin skill using repository evidence and builder-authored motivation. Preserve account-bound review files/links, token privacy, and explicit saves.
- [x] Published snapshot isolation: expose the current publication projection separately from editable drafts for the author's live preview. Test that editing drafts cannot change the live preview or share image.
- [ ] Verify: exercise focused failing tests before behavioral implementation; run `npm test` and `npm run build`; test real gated local pages at desktop/mobile sizes and inspect share PNG. Review all changes and update stale product documentation.

## Review focus

- Old/unpublished links must not return an image derived from drafts.
- A failed save or stale revision must retain the story rather than navigating to publication.
- Missing and failed screenshot URLs must remain understandable and leave links usable.
- Clipboard/native share failures must expose the usable public link without losing focus.
- Untrusted repository text must remain data, and absent motivation/learning must remain absent.

## Acceptance

An approved new builder can choose one public repo, edit its story and screenshot URL, explicitly save it, review the public projection, and explicitly publish it. Their opt-in listing displays real project imagery. Their public link carries a valid generated image containing published content only. The plugin can prepare a story for the same review boundary without writing or publishing it.

## Verification record

Node 22: 167 automated tests pass; Vercel build passes. Built server smoke checks verified protected-route redirects, valid legacy session SSR, public profile/signup access, and exact showcase image gate/failure behavior. Font and WASM assets are included in the Vercel function. Share PNGs were inspected with short and long titles. A fresh skill scenario verified source-backed no-MCP output, absent invented motivation/learning, and explicit browser save/publish boundaries. Mobile/desktop visual checks remain outstanding: browser host unavailable; Safari native automation timed out. No gate was disabled for previews.

Final review found and fixed two boundary cases with failing regression tests first: returned agent files now use the same serialization as their 64 KB size check, and clearing the guided repository selection restores focus to the visible search field. Manual-entry history now retains the saved project ID before opening review.
