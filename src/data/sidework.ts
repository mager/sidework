import recent from './sidework-contributions.json';
import history from './legacy-contributions.json';

export const contributions = [...recent, ...history].sort((a, b) => b.date.localeCompare(a.date));

export const opportunities = [
  {
    id: 'vitest', name: 'Vitest', repository: 'vitest-dev/vitest', number: 11877,
    title: 'Make Tab focus the test frame',
    description: 'The Playwright provider can send Tab to the runner page instead of the test. The issue includes a small reproduction.',
    skill: 'Browser testing', language: 'TypeScript', effort: 'Small fix',
    reason: 'Build on your browser regression tests for Impeccable.',
    next: 'Reproduce with focus outside the iframe. Check Tab and Shift+Tab before and after the change.',
    url: 'https://github.com/vitest-dev/vitest/issues/11877',
    availability: 'No linked PR seen', checkedAt: '2026-11-04',
  },
  {
    id: 'pagefind', name: 'Pagefind', repository: 'Pagefind/pagefind', number: 1405,
    title: 'Let search text follow the reader’s text size',
    description: 'Absolute font sizes prevent the search UI from following text scaling. Explore relative sizes and test the layout.',
    skill: 'Accessibility', language: 'CSS', effort: 'Focused UI fix',
    reason: 'Apply the search and responsive layout work from your blog.',
    next: 'Confirm the affected UI, then compare default and enlarged text on desktop and mobile.',
    url: 'https://github.com/Pagefind/pagefind/issues/1405',
    availability: 'No linked PR seen', checkedAt: '2026-11-04',
  },
  {
    id: 'shiki', name: 'Shiki', repository: 'shikijs/shiki', number: 1292,
    title: 'Help finish the Web Worker example',
    description: 'A maintainer welcomed a small worker example. The issue has related commits, so coordinate with the existing contributor first.',
    skill: 'Documentation', language: 'TypeScript', effort: 'Example + guide',
    reason: 'Turn your developer-tool experience into a runnable teaching example.',
    next: 'Check the related commits and current examples. Offer testing or a focused follow-up instead of duplicating work.',
    url: 'https://github.com/shikijs/shiki/issues/1292',
    availability: 'Work already started', checkedAt: '2026-11-04',
  },
  {
    id: 'zcan', name: 'Zcan', repository: 'OpenComDev/zcan', number: 6,
    title: 'Unwrap Outlook and Slack redirect links',
    description: 'Extend the browser-based link cleaner with two redirect formats. The maintainer names the source file and tests.',
    skill: 'URL handling', language: 'TypeScript', effort: 'Good first issue',
    reason: 'A small, clearly scoped contribution to a new project.',
    next: 'Add both redirect formats. Test encoded destinations, missing parameters, and existing rules.',
    url: 'https://github.com/OpenComDev/zcan/issues/6',
    availability: 'No linked PR seen', checkedAt: '2026-11-04',
  },
];
