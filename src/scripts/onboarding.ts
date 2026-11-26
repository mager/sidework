import { openDraftWorkspace } from './draft-storage';
import { readState } from './sidework-state.mjs';
import { fetchLinkedRepositories, fetchRepositories, githubHandle, importedProjects, importSelection, projectKey, repositorySource, repositorySources } from './github-import.mjs';
import { connectFavorites } from './showcase-favorites';

type Repository = Awaited<ReturnType<typeof fetchRepositories>>[number];

async function startImport() {
  const element = (id: string) => document.getElementById(id)!;
  const input = (id: string) => element(id) as HTMLInputElement;
  const button = (id: string) => element(id) as HTMLButtonElement;
  const form = element('github-import-form') as HTMLFormElement;
  const choices = form.elements.namedItem('source') as RadioNodeList;
  const seed = JSON.parse(element('import-seed').textContent!);
  const workspace = await openDraftWorkspace(element('main'), seed.projects, () => { loadExisting(); render(); });
  if (!workspace) return;
  const favorites = connectFavorites();
  const journey = workspace.account && new URLSearchParams(location.search).get('journey') === 'first';

  const selected = new Set<string>();
  const snapshots = new Map<string, Repository[]>();
  let repositories: Repository[] = [];
  let alreadyImported = importedProjects([]);
  let source = repositorySource(choices.value);
  const pageSize = 25;
  let visible = pageSize;
  let hasLoaded = false;
  let pending: AbortController | null = null;

  function status(message: string) {
    element('import-status').textContent = message;
  }

  function loadExisting() {
    const state = readState(JSON.stringify(workspace!.read()), seed.opportunityIds);
    alreadyImported = importedProjects([...(state.includeExamples ? seed.projects : []), ...state.projects]);
    for (const repo of repositories) if (alreadyImported(repo.project)) selected.delete(projectKey(repo.project));
  }

  function matching() {
    const terms = input('repo-search').value.trim().toLowerCase().replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '').replace(/\.git$/, '').split(/\s+/).filter(Boolean);
    const recent = (element('repo-sort') as HTMLSelectElement).value === 'recent';
    return repositories.filter(repo =>
      (source === 'stars' || !alreadyImported(repo.project)) &&
      (source !== 'repositories' || input('include-forks').checked || !repo.fork) &&
      (input('include-archived').checked || !repo.archived) &&
      terms.every(term => `${repo.fullName} ${repo.project.description} ${repo.project.stack}`.toLowerCase().includes(term))
    ).sort((a, b) => {
      const dateDifference = recent ? (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0) : 0;
      return dateDifference || a.fullName.localeCompare(b.fullName, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  function updateSelection(results = matching()) {
    const hasSelection = source !== 'stars' && selected.size > 0;
    element('import-actions').hidden = !hasSelection;
    element('clear-selection').hidden = !hasSelection;
    element('selection-count').textContent = journey ? 'One project · Next: tell its story' : `${selected.size} selected`;
    const matches = new Set(results.map(repo => projectKey(repo.project)));
    const outside = [...selected].filter(key => !matches.has(key)).length;
    element('selection-detail').textContent = outside ? `${outside} selected ${outside === 1 ? 'repository is' : 'repositories are'} outside these results.` : 'Already added projects are hidden.';
    button('import-selected').disabled = pending !== null || workspace!.busy || !hasSelection;
    button('import-selected').textContent = journey ? 'Continue with this project' : selected.size ? `Import ${selected.size} ${selected.size === 1 ? 'project' : 'projects'}` : 'Import selected';
  }

  function repositoryRow(repo: Repository) {
    const row = document.createElement('li');
    row.className = 'repo-row';
    const copy = document.createElement('span');
    copy.className = 'repo-copy';
    const title = document.createElement('strong');
    title.textContent = repo.fullName;
    const description = document.createElement('span');
    description.className = 'repo-description';
    description.textContent = repo.project.description || 'No description on GitHub yet.';
    const meta = document.createElement('small');
    const key = projectKey(repo.project);
    meta.textContent = [repo.project.stack, repo.fork ? 'Fork' : '', repo.archived ? 'Archived' : ''].filter(Boolean).join(' · ');
    const link = document.createElement('a');
    link.href = repo.project.source;
    if (source === 'stars') {
      link.append(title);
      copy.append(link, description, meta);
      row.append(copy);
      if (favorites) row.append(favorites.button(repo.project.id.slice('github-'.length), repo.fullName));
      return row;
    }

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = journey ? 'radio' : 'checkbox';
    if(journey) checkbox.name = 'first-project';
    checkbox.checked = selected.has(key);
    checkbox.setAttribute('aria-label', repo.fullName);
    checkbox.addEventListener('change', () => {
      if (journey) selected.clear();
      if (checkbox.checked) selected.add(key);
      else selected.delete(key);
      updateSelection();
    });
    copy.append(title, description, meta);
    label.append(checkbox, copy);
    link.className = 'repo-source';
    link.textContent = 'GitHub';
    link.setAttribute('aria-label', `Open ${repo.fullName} on GitHub`);
    row.append(label, link);
    return row;
  }

  function render() {
    const matches = matching();
    const added = source === 'stars' ? 0 : repositories.filter(repo => alreadyImported(repo.project)).length;
    element('repo-results').hidden = !hasLoaded;
    element('repo-count').textContent = `${Math.min(visible, matches.length)} of ${matches.length} ${matches.length === 1 ? 'result' : 'results'}${added ? ` · ${added} already added` : ''}`;
    element('repo-list').replaceChildren(...matches.slice(0, visible).map(repositoryRow));
    button('show-more').hidden = matches.length <= visible;
    button('show-more').textContent = `Show ${Math.max(0, Math.min(pageSize, matches.length - visible))} more repositories`;
    element('repo-empty').hidden = matches.length > 0;
    const allAdded = repositories.length > 0 && added === repositories.length;
    element('repo-empty-title').textContent = allAdded ? 'These repositories are already added.' : repositories.length ? 'No matching repositories.' : 'No public repositories found.';
    element('repo-empty-text').textContent = allAdded ? 'Edit their stories in your workbench, or browse another GitHub account.' : repositories.length ? 'Try another name, description, or language, or clear the filters.' : 'Try another GitHub account or add a project manually.';
    button('clear-filters').hidden = !input('repo-search').value && input('include-forks').checked && input('include-archived').checked;
    button('select-matching').textContent = `Select all ${matches.length} results`;
    button('select-matching').disabled = !matches.length;
    updateSelection(matches);
  }

  function configureSource() {
    element('find-repos-label').textContent = `Find ${repositorySources[source].toLowerCase()}`;
    element('include-forks-control').hidden = source !== 'repositories';
    element('select-matching').hidden = journey || source === 'stars';
    favorites?.show(source === 'stars');
  }

  function setLoading(loading: boolean) {
    button('find-repos').disabled = loading;
    element('cancel-import').hidden = !loading;
  }

  async function loadLinkedRepositories(names: string[]) {
    const current = new AbortController();
    pending = current;
    const timeout = setTimeout(() => current.abort(), 30000);
    setLoading(true);
    status('Loading the linked repositories…');
    try {
      loadExisting();
      const result = await fetchLinkedRepositories(names, { signal: current.signal });
      if (pending !== current) return;
      repositories = result.repositories;
      hasLoaded = true;
      if (repositories.some(repo => repo.fork)) input('include-forks').checked = true;
      if (repositories.some(repo => repo.archived)) input('include-archived').checked = true;
      for (const repo of repositories) {
        if (!journey && !alreadyImported(repo.project)) selected.add(projectKey(repo.project));
      }
      const loaded = repositories.length ? 'Review the repositories below.' : 'No linked repositories are available to import.';
      const unavailable = result.unavailable.length ? ` Could not load these public repositories: ${result.unavailable.join(', ')}.` : '';
      status(loaded + unavailable);
    } catch (error: any) {
      if (pending !== current) return;
      status(current.signal.aborted ? 'Import search stopped. Reload this page to retry.' : error.message);
    } finally {
      clearTimeout(timeout);
      if (pending === current) {
        pending = null;
        setLoading(false);
        render();
      }
    }
  }

  async function loadCollection(useSnapshot: boolean) {
    const collection = source;
    const name = repositorySources[collection].toLowerCase();
    let handle: string;
    try {
      handle = githubHandle(input('github-handle').value);
      if (source !== 'stars') loadExisting();
    } catch (error: any) {
      status(error?.name === 'SecurityError' ? 'Browser storage is blocked. Allow storage to import projects.' : error.message);
      return;
    }

    const key = `${collection}:${handle.toLowerCase()}`;
    const saved = snapshots.get(key);
    const summary = (items: Repository[]) => items.length
      ? `Loaded ${items.length} public ${items.length === 1 ? { repositories: 'repository', stars: 'star', forks: 'fork' }[collection] : name} for @${handle}.`
      : `No public ${name} found for @${handle}.`;
    selected.clear();
    visible = pageSize;
    repositories = saved ?? [];
    hasLoaded = !!saved;
    element('import-result').hidden = true;
    if (useSnapshot && saved) {
      status(summary(saved));
      render();
      return;
    }

    const current = new AbortController();
    pending = current;
    const timeout = setTimeout(() => current.abort(), 120000);
    setLoading(true);
    status(`Loading public ${name} for @${handle}…`);
    render();
    try {
      const results = await fetchRepositories(handle, {
        source: collection,
        signal: current.signal,
        onProgress: (count: number) => {
          if (pending === current && count) status(`Loading @${handle}’s ${name}. Found ${count} so far…`);
        },
      });
      if (pending !== current) return;
      snapshots.set(key, results);
      repositories = results;
      hasLoaded = true;
      status(summary(results));
    } catch (error: any) {
      if (pending !== current) return;
      const message = current.signal.aborted ? 'Search stopped. Try again when you are ready.' : error.message;
      status(saved ? `${message} Showing the last results for @${handle}.` : message);
    } finally {
      clearTimeout(timeout);
      if (pending === current) {
        pending = null;
        setLoading(false);
        render();
      }
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (pending) return;
    const url = new URL(location.href);
    if (url.searchParams.has('repo')) {
      url.searchParams.delete('repo');
      history.replaceState(history.state, '', url);
    }
    void loadCollection(false);
  });
  form.addEventListener('change', event => {
    if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'source') return;
    pending?.abort();
    pending = null;
    setLoading(false);
    source = repositorySource(choices.value);
    configureSource();
    const url = new URL(location.href);
    url.searchParams.delete('repo');
    if (source === 'repositories') url.searchParams.delete('view');
    else url.searchParams.set('view', source);
    history.replaceState(history.state, '', url);
    input('repo-search').value = '';
    repositories = [];
    hasLoaded = false;
    selected.clear();
    element('import-result').hidden = true;
    status('Enter a GitHub handle to load this collection.');
    render();
    if (input('github-handle').value.trim()) void loadCollection(true);
  });
  element('cancel-import').addEventListener('click', () => pending?.abort());
  for (const id of ['repo-search', 'include-forks', 'include-archived']) {
    element(id).addEventListener('input', () => { visible = pageSize; render(); });
  }
  element('repo-sort').addEventListener('change', () => { visible = pageSize; render(); });
  element('clear-filters').addEventListener('click', () => {
    input('repo-search').value = '';
    input('include-forks').checked = true;
    input('include-archived').checked = true;
    visible = pageSize;
    render();
    input('repo-search').focus();
  });
  element('select-matching').addEventListener('click', () => {
    for (const repo of matching()) {
      if (!alreadyImported(repo.project)) selected.add(projectKey(repo.project));
    }
    render();
  });
  element('clear-selection').addEventListener('click', () => {
    selected.clear();
    render();
    if (journey || button('select-matching').disabled) input('repo-search').focus();
    else button('select-matching').focus();
  });
  element('show-more').addEventListener('click', () => {
    const previous = visible;
    visible += pageSize;
    render();
    element('repo-list').children[previous]?.querySelector<HTMLElement>('input,a')?.focus();
  });
  element('import-selected').addEventListener('click', async () => {
    if (source === 'stars' || pending || workspace.busy || !selected.size) return;
    try {
      const chosen = repositories.filter(repo => selected.has(projectKey(repo.project))).map(repo => repo.project);
      const result = importSelection(JSON.stringify(workspace.read()), chosen, seed.projects, seed.opportunityIds);
      button('import-selected').disabled = true;
      await workspace.save(result.value, { projectsOnly: true });
      if(journey && chosen.length === 1) {
        const saved = workspace.read().projects.find((project: Repository['project']) => project.id === chosen[0].id || projectKey(project) === projectKey(chosen[0]));
        if(!saved) throw new Error('The selected project could not be found after saving. Your other drafts are still saved.');
        const editUrl = `/workbench/?journey=first&project=${encodeURIComponent(saved.id)}#editor`;
        location.assign(editUrl);
        return;
      }
      selected.clear();
      loadExisting();
      render();
      element('import-result-text').textContent = `${result.count} ${result.count === 1 ? 'project imported' : 'projects imported'}. Your drafts are saved ${workspace.account ? 'to your account' : 'in this browser'}.`;
      element('import-result').hidden = false;
      element('import-result').scrollIntoView({ block: 'nearest' });
      element('import-result').querySelector('a')?.focus({ preventScroll: true });
    } catch (error: any) {
      status(error?.name === 'QuotaExceededError' ? 'This browser is out of storage. Remove old drafts or select fewer projects.' : error?.name === 'SecurityError' ? 'Browser storage is blocked. Allow storage and try again.' : error.message || 'Could not save. Please try again.');
    } finally {
      updateSelection();
    }
  });

  configureSource();
  const linkedNames = new URLSearchParams(location.search).getAll('repo');
  if (linkedNames.length) void loadLinkedRepositories(linkedNames);
  else if ((workspace.account || source !== 'repositories') && input('github-handle').value.trim()) void loadCollection(true);
}

void startImport();
