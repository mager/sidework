import { STORAGE_KEY } from './sidework-state.mjs';
export const FOLLOW_KEY = 'sidework-follow-mager';
export const COLLECTION_KEY = 'sidework-collection-v1';
export const RESET_BACKUP_KEY = 'sidework-reset-backup-v1';
export const WORKSPACE_KEYS = [STORAGE_KEY, FOLLOW_KEY, COLLECTION_KEY];
const emptyWorkspace = () => JSON.stringify({ version: 1, projects: [], plan: {}, weekStartedAt: null, showcase: [], includeExamples: false });

export function resetWorkspace(storage) {
  const values = Object.fromEntries(WORKSPACE_KEYS.map(key => [key, storage.getItem(key)]));
  // Keep the previous state before changing anything. If backup fails, do not reset.
  storage.setItem(RESET_BACKUP_KEY, JSON.stringify({ version: 1, values }));
  try {
    storage.setItem(STORAGE_KEY, emptyWorkspace());
    storage.removeItem(FOLLOW_KEY);
    storage.removeItem(COLLECTION_KEY);
  } catch (error) {
    for (const [key, value] of Object.entries(values)) {
      try { value === null ? storage.removeItem(key) : storage.setItem(key, value); } catch {}
    }
    throw error;
  }
}
export function restoreWorkspace(storage) {
  const backup = JSON.parse(storage.getItem(RESET_BACKUP_KEY) || 'null');
  if (backup?.version !== 1 || !backup.values || !WORKSPACE_KEYS.every(key => backup.values[key] === null || typeof backup.values[key] === 'string')) throw new Error('No valid previous workspace is available.');
  const current = Object.fromEntries(WORKSPACE_KEYS.map(key => [key, storage.getItem(key)]));
  try {
    for (const key of WORKSPACE_KEYS) {
      const value = backup.values[key];
      value === null ? storage.removeItem(key) : storage.setItem(key, value);
    }
  } catch (error) {
    for (const [key, value] of Object.entries(current)) {
      try { value === null ? storage.removeItem(key) : storage.setItem(key, value); } catch {}
    }
    throw error;
  }
}
