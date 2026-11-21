import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rmdir, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createGitHub, githubReference } from './github.mjs';

const commands = [
  'list', 'find', 'project add <owner/repo>', 'project remove <owner/repo>',
  'contribution select <owner/repo#number>', 'contribution deselect <owner/repo#number>', 'check', 'poll',
];

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw new Error(`Could not read Sidework state at ${path}. Check the file before retrying.`);
  }
}

async function writeJson(path, value) {
  const temp = `${path}.${randomUUID()}.tmp`;
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  try {
    await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
    await rename(temp, path);
  } finally {
    await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

async function readWorkspace(path) {
  const state = await readJson(path, { version: 1, projects: [], contributions: [] });
  if (state?.version !== 1 || !Array.isArray(state.projects) || !Array.isArray(state.contributions)) {
    throw new Error(`Sidework cannot use this workspace format at ${path}.`);
  }
  return state;
}

async function withLocalLock(path, action) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const lock = `${path}.lock`;
  try {
    await mkdir(lock);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Another Sidework operation is in progress. Retry after it finishes. If it was interrupted, remove the empty lock directory at ${lock}.`);
    throw error;
  }
  try {
    return await action();
  } finally {
    await rmdir(lock);
  }
}

async function updateWorkspace(path, field, target, remove) {
  return withLocalLock(path, async () => {
    const state = await readWorkspace(path);
    const items = state[field];
    const index = items.findIndex(item => item.repository.toLowerCase() === target.repository.toLowerCase() && (item.number ?? null) === (target.number ?? null));
    if (remove ? index === -1 : index !== -1) return { changed: false, ...state };
    if (remove) items.splice(index, 1);
    else items.push(field === 'contributions' ? { ...target, trackingId: randomUUID() } : target);
    await writeJson(path, state);
    return { changed: true, ...state };
  });
}

async function checkPullRequests(github, contributions, pollPath) {
  const previous = pollPath ? await readJson(pollPath, {}) : {};
  const next = {};
  const pullRequests = [];
  const errors = [];
  for (const { repository, number, url, trackingId } of contributions) {
    const source = { repository, number, url };
    try {
      const ref = githubReference(`${repository}#${number}`);
      const snapshot = await github.review(ref.repository, ref.number);
      const stamp = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
      if (!pollPath || previous[trackingId] !== stamp) pullRequests.push({ ...source, ...snapshot });
      next[trackingId] = stamp;
    } catch (error) {
      errors.push({ ...source, message: error.message });
      if (previous[trackingId]) next[trackingId] = previous[trackingId];
    }
  }
  if (pollPath && JSON.stringify(next) !== JSON.stringify(previous)) await writeJson(pollPath, next);
  return { checkedAt: new Date().toISOString(), selected: contributions.length, checked: contributions.length - errors.length, pullRequests, errors };
}

export async function runSidework(args, { github = createGitHub(), stateDirectory = join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'sidework') } = {}) {
  const [group, action, input] = args;
  if (!args.length || (args.length === 1 && ['help', '--help', '-h'].includes(group))) return { commands };
  const editProject = group === 'project' && ['add', 'remove'].includes(action);
  const editContribution = group === 'contribution' && ['select', 'deselect'].includes(action);
  const edit = args.length === 3 && (editProject || editContribution);
  if (!edit && !(args.length === 1 && ['list', 'find', 'check', 'poll'].includes(group))) {
    throw new Error('Unknown command. Run with --help to see the Sidework commands.');
  }
  const reference = edit ? githubReference(input) : null;
  if (edit && editProject !== (reference.number === null)) {
    throw new Error(editProject ? 'Use a repository reference for a project.' : 'Use a pull request reference to select or deselect a contribution.');
  }
  const account = await github.account();
  const accountDir = join(stateDirectory, account.id);
  const workspacePath = join(accountDir, 'workspace.json');
  if (edit) {
    const remove = action === 'remove' || action === 'deselect';
    const target = remove ? reference : editProject ? await github.repository(reference.repository) : await github.contribution(reference.repository, reference.number, account);
    const state = await updateWorkspace(workspacePath, editProject ? 'projects' : 'contributions', target, remove);
    return { account, ...state };
  }
  if (group === 'find') return { account, ...await github.find(account) };
  const state = await readWorkspace(workspacePath);
  if (group === 'list') return { account, ...state };
  const pollPath = join(accountDir, 'poll.json');
  const result = group === 'poll' ? await withLocalLock(pollPath, () => checkPullRequests(github, state.contributions, pollPath)) : await checkPullRequests(github, state.contributions, null);
  return { account, ...result };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runSidework(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.errors?.length) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Sidework: ${error.message}\n`);
    process.exitCode = 1;
  }
}
