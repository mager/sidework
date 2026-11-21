import { spawnSync } from 'node:child_process';

const commentFields = 'id url body createdAt updatedAt author { login }';
const inlineCommentFields = `${commentFields} state`;
const reviewQuery = `query($owner: String!, $name: String!, $number: Int!, $cursor: String, $overview: Boolean!) {
  repository(owner: $owner, name: $name) {
    isPrivate
    pullRequest(number: $number) {
      title state isDraft reviewDecision
      comments(last: 30) @include(if: $overview) { totalCount nodes { ${commentFields} } }
      reviews(last: 30) @include(if: $overview) {
        totalCount nodes { id url body submittedAt lastEditedAt state author { login } }
      }
      reviewThreads(first: 30, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id isResolved isOutdated path line
          firstComment: comments(first: 1) { nodes { ${inlineCommentFields} } }
          comments(last: 10) { totalCount nodes { ${inlineCommentFields} } }
        }
      }
    }
  }
}`;

function callGh(args, input) {
  const env = { ...process.env, GH_PROMPT_DISABLED: '1', GH_DEBUG: '' };
  const result = spawnSync('gh', ['api', '--hostname', 'github.com', ...args], {
    env, input: input && JSON.stringify(input), encoding: 'utf8', timeout: 20_000, maxBuffer: 12 * 1024 * 1024,
  });
  if (result.error?.code === 'ENOENT') throw new Error('Install the GitHub CLI (gh).');
  if (result.error?.code === 'ETIMEDOUT') throw new Error('GitHub timed out. Try again.');
  if (result.error?.code === 'ENOBUFS') throw new Error('GitHub returned more data than this check can read.');
  if (result.status !== 0) {
    // GitHub CLI diagnostics can include request and credential details.
    const status = result.stderr?.match(/\(HTTP (\d{3})\)/)?.[1];
    if (status === '401' || result.stderr?.includes('gh auth login')) throw new Error('Sign in to github.com with gh auth login.');
    if (status === '404') throw new Error('GitHub could not find this repository or pull request.');
    if (status === '429' || /rate limit/i.test(result.stderr || '')) throw new Error('GitHub rate limit reached. Try again later.');
    throw new Error('GitHub could not complete this check. Check access and connectivity.');
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error('GitHub did not return valid JSON.');
  }
}

export function githubReference(input) {
  const url = input.match(/^https:\/\/github\.com\/([^?#]+)(?:\?[^#]*)?(?:#.*)?$/i);
  const value = url ? url[1].replace(/\/$/, '').replace(/\/pull\/(\d+)$/, '#$1') : input;
  const match = value.match(/^([a-z\d](?:[a-z\d-]{0,38})\/[a-z\d_.-]{1,100})(?:#([1-9]\d*))?$/i);
  const number = match?.[2] ? Number(match[2]) : null;
  if (!match || /\/\.{1,2}$/.test(match[1]) || (number !== null && (!Number.isSafeInteger(number) || number > 2147483647))) {
    throw new Error('Use a public GitHub owner/repo, owner/repo#number, or HTTPS repository or pull request URL.');
  }
  return { repository: match[1], number };
}

const repositoryUrl = repository => `https://github.com/${repository}`;
const pullUrl = (repository, number) => `${repositoryUrl(repository)}/pull/${number}`;
const nodes = connection => connection.nodes.filter(Boolean);
const excerpt = item => ({
  id: item.id, url: item.url, author: item.author ? `@${item.author.login}` : null,
  createdAt: item.createdAt ?? item.submittedAt, editedAt: item.updatedAt ?? item.lastEditedAt,
  body: item.body.slice(0, 1200), bodyTruncated: item.body.length > 1200,
});

function reviewThread(thread) {
  const sample = new Map([...nodes(thread.firstComment), ...nodes(thread.comments)].map(item => [item.id, item]));
  const comments = [...sample.values()].filter(item => item.state !== 'PENDING').map(excerpt);
  if (!comments.length) return null;
  return {
    id: thread.id, path: thread.path, line: thread.line, isResolved: thread.isResolved, isOutdated: thread.isOutdated,
    omittedComments: thread.comments.totalCount - sample.size, comments,
  };
}

export function createGitHub(api = callGh) {
  async function account() {
    const user = await api(['user']);
    if (!Number.isSafeInteger(user.id) || user.id < 1 || !/^[a-z\d-]+$/i.test(user.login)) throw new Error('GitHub did not return a valid signed-in account.');
    return { id: String(user.id), handle: `@${user.login}` };
  }

  async function repository(name) {
    const repo = await api([`repos/${name}`]);
    if (repo.visibility !== 'public') throw new Error('Sidework tracks public GitHub repositories only.');
    const { repository, number } = githubReference(repo.full_name);
    if (number !== null) throw new Error('GitHub did not return a valid repository.');
    return { repository, url: repositoryUrl(repository), fork: repo.fork === true };
  }

  async function contribution(name, number, viewer) {
    const repo = await repository(name);
    if (repo.repository.split('/')[0].toLowerCase() === viewer.handle.slice(1).toLowerCase()) {
      throw new Error('Add your own repository as a project. Select a contribution in an upstream repository.');
    }
    const pr = await api([`repos/${repo.repository}/pulls/${number}`]);
    if (String(pr.user?.id) !== viewer.id) throw new Error(`Select a pull request authored by ${viewer.handle}.`);
    return { repository: repo.repository, number, url: pullUrl(repo.repository, number) };
  }

  async function find(viewer) {
    const search = await api(['search/issues', '--method', 'GET', '-f', `q=is:pr is:open is:public archived:false author:${viewer.handle.slice(1)} -user:${viewer.handle.slice(1)}`, '-f', 'sort=updated', '-F', 'per_page=30']);
    const candidates = search.items.map(item => {
      const ref = githubReference(item.html_url);
      return { ...ref, url: pullUrl(ref.repository, ref.number), title: item.title };
    });
    return { candidates, incomplete: search.incomplete_results || search.total_count > candidates.length };
  }

  async function review(name, number) {
    const repo = await repository(name);
    const [owner, repoName] = repo.repository.split('/');
    const threads = [];
    const seenCursors = new Set();
    let cursor = null;
    let overview;
    do {
      const response = await api(['graphql', '--input', '-'], {
        query: reviewQuery, variables: { owner, name: repoName, number, cursor, overview: cursor === null },
      });
      const source = response.data?.repository;
      const pr = source?.pullRequest;
      if (source?.isPrivate) throw new Error('Sidework tracks public GitHub repositories only.');
      if (response.errors?.length || !pr) throw new Error('GitHub did not return complete pull request evidence.');
      overview ??= pr;
      const { nodes: page, pageInfo } = pr.reviewThreads;
      threads.push(...page.filter(Boolean).map(reviewThread).filter(Boolean));
      if (pageInfo.hasNextPage && (!pageInfo.endCursor || seenCursors.has(pageInfo.endCursor))) throw new Error('GitHub did not return the next review thread page.');
      seenCursors.add(pageInfo.endCursor);
      cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    } while (cursor);
    const { title, state, isDraft, reviewDecision, comments, reviews } = overview;
    if (!['OPEN', 'CLOSED', 'MERGED'].includes(state)) throw new Error('GitHub did not return a known pull request status.');
    const submitted = nodes(reviews).filter(item => item.state !== 'PENDING');
    return {
      title, status: state === 'OPEN' && isDraft ? 'draft' : state.toLowerCase(), reviewDecision,
      threads, conversation: nodes(comments).map(excerpt), reviews: submitted.map(item => ({ ...excerpt(item), state: item.state })),
      omittedConversationComments: comments.totalCount - comments.nodes.length,
      omittedReviews: reviews.totalCount - reviews.nodes.length,
    };
  }

  return { account, repository, contribution, find, review };
}
