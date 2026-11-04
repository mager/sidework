export const projects = [
  {
    id: 'perch', name: 'Perch', kind: 'Mac monitoring', stack: 'Node.js · Redis',
    tagline: 'A quiet lookout for your Mac.',
    description: 'I built Perch to check on my Mac mini without opening a terminal. A self-hosted dashboard brings together heartbeats, system resources, and tmux sessions.',
    note: 'In development · Self-hosted',
    url: 'https://perch-mac-app.vercel.app', source: 'https://github.com/mager/perch',
    story: '/blog/2026-10-04-perch/',
  },
  {
    id: 'moodsh', name: 'Mood Shell', kind: 'Terminal toolkit', stack: 'Rust',
    tagline: 'A little color in the command line.',
    description: 'A small prompt toolkit for Zsh, Bash, and PowerShell. Pick a palette, tune it with live previews, and share your theme as a Markdown file. The command is moodsh.',
    note: 'macOS · Linux · Windows',
    url: 'https://moodsh.vercel.app', source: 'https://github.com/mager/moodsh',
    story: '/blog/2026-10-02-mood-shell/',
  },
  {
    id: 'homeport', name: 'Homeport', kind: 'Coding workspace', stack: 'Python · Pydantic · SQLite',
    tagline: 'Somewhere for the work to stay.',
    description: 'Start a Codex task, close your laptop, and return to the same conversation. A private browser workspace keeps the agent processes, repositories, and task history on your own computer.',
    note: 'Early release · Self-hosted',
    url: 'https://homeport-gamma.vercel.app/', source: 'https://github.com/mager/homeport',
    story: '/blog/2026-10-04-homeport/',
  },
  {
    id: 'prxps', name: 'prxps', kind: 'Sports picks', stack: 'SvelteKit · TypeScript · Rust',
    tagline: 'Make the call. Keep the receipt.',
    description: 'My sports picks project. Make free picks, build a public record, and earn RXP for correct calls. RXP is an in-game reputation currency with no monetary value.',
    note: 'Web app · Free picks',
    url: 'https://prxps.xyz',
    story: '/blog/2026-09-30-rust-backend-prxps-rxp-calculator/',
  },
];
