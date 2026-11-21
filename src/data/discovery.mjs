// Public GitHub repository owners and descriptions checked on 2026-11-21.
const developers = [
  {
    githubId: '43004',
    handle: 'pbakaus',
    project: 'Impeccable',
    repository: 'pbakaus/impeccable',
    description: 'Design tools for coding agents that build and review interfaces.',
  },
  {
    githubId: '9599',
    handle: 'simonw',
    project: 'Datasette',
    repository: 'simonw/datasette',
    description: 'Explore and publish data from SQLite databases.',
  },
  {
    githubId: '170270',
    handle: 'sindresorhus',
    project: 'Actions',
    repository: 'sindresorhus/Actions',
    description: 'Add more actions to Apple’s Shortcuts app.',
  },
  {
    githubId: '456674',
    handle: 'BurntSushi',
    project: 'ripgrep',
    repository: 'BurntSushi/ripgrep',
    description: 'Search files from the command line using patterns and Git ignore rules.',
  },
];

export function discoverDevelopers(viewerGithubId = '') {
  return developers.filter(developer => developer.githubId !== viewerGithubId);
}
