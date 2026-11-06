// Runs in the head before paint; controls connect after the document is ready.
(() => {
  const key = 'sidework-theme';
  const normalize = value => value === 'light' || value === 'dark' ? value : 'system';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { preference = normalize(localStorage.getItem(key)); } catch {}

  const apply = () => {
    document.documentElement.dataset.theme = preference === 'system'
      ? (media.matches ? 'dark' : 'light') : preference;
    document.querySelectorAll('[data-theme-select]').forEach(select => {
      select.value = preference;
    });
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = normalize(event.newValue);
    apply();
  });
  const connect = () => {
    document.querySelectorAll('[data-theme-control]').forEach(control => {
      control.hidden = false;
      control.querySelector('select').addEventListener('change', event => {
        preference = normalize(event.target.value);
        apply();
        try { localStorage.setItem(key, preference); } catch {}
      });
    });
    apply();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect, { once: true });
  } else connect();
})();
