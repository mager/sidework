type FavoriteRecord = { revision: number; favorites: { id: string }[] };

export function connectFavorites() {
  const tools = document.getElementById('favorite-tools');
  const account = document.querySelector<HTMLMetaElement>('meta[name="sidework-account"]')?.content;
  if (!tools || !account) return null;

  const status = document.getElementById('favorite-status')!;
  const retry = document.getElementById('favorite-retry')!;
  let record: FavoriteRecord | null = null;
  let busy = false;

  async function request(body?: URLSearchParams) {
    const response = await fetch('/api/account/favorites', {
      method: body ? 'POST' : 'GET', body, headers: { 'X-Sidework-Account': account! }, cache: 'no-store',
    });
    const data = await response.json();
    if (response.status === 409) return null;
    if (!response.ok) throw new Error(data.error || 'Favorites are unavailable. Try again.');
    return data as FavoriteRecord;
  }

  function updateButton(button: HTMLButtonElement) {
    const saved = record?.favorites.some(favorite => favorite.id === button.dataset.favoriteId);
    button.textContent = saved ? 'In favorites' : 'Add to favorites';
    const repository = button.dataset.repository;
    button.setAttribute('aria-label', saved ? `${repository} is in favorites` : `Add ${repository} to favorites`);
    button.setAttribute('aria-disabled', String(Boolean(saved || busy || !record)));
  }

  function updateButtons() {
    document.querySelectorAll<HTMLButtonElement>('.repo-favorite').forEach(updateButton);
  }

  async function load() {
    if (busy) return;
    busy = true;
    status.textContent = 'Loading favorites…';
    retry.hidden = true;
    updateButtons();
    try {
      record = await request();
      status.textContent = '';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Favorites could not load.';
      retry.hidden = false;
    } finally {
      busy = false;
      updateButtons();
    }
  }

  async function add(button: HTMLButtonElement, id: string, repository: string) {
    if (!record || button.getAttribute('aria-disabled') === 'true') return;
    busy = true;
    updateButtons();
    let conflict = false;
    try {
      const saved = await request(new URLSearchParams({ favoriteId: id, revision: String(record.revision) }));
      if (saved) {
        record = saved;
        status.textContent = `Added ${repository} to favorites.`;
      } else conflict = true;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'The repository could not be saved.';
    } finally {
      busy = false;
      updateButtons();
    }
    if (conflict) {
      record = null;
      await load();
      if (record) status.textContent = 'Favorites changed in another window. Try again.';
    }
  }

  retry.addEventListener('click', () => void load());
  return {
    show(visible: boolean) {
      tools.hidden = !visible;
      if (visible && !record) void load();
    },
    button(id: string, repository: string) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sw-button repo-favorite';
      button.dataset.favoriteId = id;
      button.dataset.repository = repository;
      updateButton(button);
      button.addEventListener('click', () => void add(button, id, repository));
      return button;
    },
  };
}
