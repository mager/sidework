import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const script = readFileSync(new URL('../src/scripts/theme.js', import.meta.url), 'utf8');
function setup({ saved, dark = false, blocked = false } = {}) {
  const dom = new JSDOM('<label hidden data-theme-control><select data-theme-select><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>', { url: 'https://sidework.example', runScripts: 'outside-only' });
  const { window } = dom;
  let onChange;
  const media = { matches: dark, addEventListener: (_, callback) => { onChange = callback; } };
  window.matchMedia = () => media;
  if (saved !== undefined) window.localStorage.setItem('sidework-theme', saved);
  if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } });
  window.eval(script);
  const beforeReady = window.document.documentElement.dataset.theme;
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const select = window.document.querySelector('select');
  return { dom, window, select, beforeReady,
    theme: () => window.document.documentElement.dataset.theme,
    choose(value) { select.value = value; select.dispatchEvent(new window.Event('change')); },
    system(dark) { media.matches = dark; onChange(); },
  };
}

test('system is the default, applies before controls load, and follows device changes', () => {
  const app = setup({ dark: true });
  assert.equal(app.beforeReady, 'dark');
  assert.equal(app.select.value, 'system');
  assert.equal(app.window.document.querySelector('label').hidden, false);
  app.system(false);
  assert.equal(app.theme(), 'light');
  app.dom.window.close();
});

test('explicit choices persist across pages and ignore device changes until System is selected', () => {
  const app = setup();
  app.choose('dark');
  app.system(false);
  assert.equal(app.theme(), 'dark');
  const next = setup({ saved: app.window.localStorage.getItem('sidework-theme') });
  assert.equal(next.beforeReady, 'dark');
  assert.equal(next.select.value, 'dark');
  app.choose('light');
  app.system(true);
  assert.equal(app.theme(), 'light');
  app.choose('system');
  assert.equal(app.theme(), 'dark');
  assert.equal(app.window.localStorage.getItem('sidework-theme'), 'system');
  app.dom.window.close(); next.dom.window.close();
});

test('invalid preferences and blocked storage fall back to System; controls still work', () => {
  for (const options of [{ saved: 'invalid', dark: true }, { blocked: true, dark: true }]) {
    const app = setup(options);
    assert.equal(app.theme(), 'dark');
    assert.equal(app.select.value, 'system');
    app.choose('light');
    assert.equal(app.theme(), 'light');
    app.dom.window.close();
  }
});

test('theme changes and cleared storage in another tab update the current page', () => {
  const app = setup({ saved: 'dark' });
  app.window.dispatchEvent(new app.window.StorageEvent('storage', { key: 'sidework-theme', newValue: 'light' }));
  assert.equal(app.theme(), 'light');
  assert.equal(app.select.value, 'light');
  app.system(true);
  app.window.dispatchEvent(new app.window.StorageEvent('storage', { key: null }));
  assert.equal(app.theme(), 'dark');
  assert.equal(app.select.value, 'system');
  app.dom.window.close();
});
