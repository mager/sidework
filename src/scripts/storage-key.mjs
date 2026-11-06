export function storageKey(base, accountId = typeof document === 'undefined' ? '' : document.querySelector('meta[name="sidework-account"]')?.getAttribute('content') || '') {
  return /^\d+$/.test(accountId) ? `${base}:github:${accountId}` : base;
}
