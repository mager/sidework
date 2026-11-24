import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initializeShowcaseSharing } from '../src/scripts/showcase-sharing.mjs';
import { showcaseMetadata } from '../src/lib/showcase-metadata.mjs';

const slug = 'a'.repeat(32);
const content = { handle: '@maker', project: { name: 'Published name', tagline: 'The published purpose.', description: 'The saved description.' } };
const controls = () => new JSDOM(`<input id="showcase-public-link" readonly value="https://sidework.example/showcase/${slug}/" data-share-title="Published name by @maker"><button id="copy-showcase-link" hidden>Copy</button><button id="share-showcase-link" hidden>Share</button><p id="showcase-copy-status" hidden></p>`);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('published metadata uses a canonical public URL and same-route image, excluding query state', () => {
  const metadata = showcaseMetadata(content, slug, 'https://sidework.example');
  assert.equal(metadata.title, 'Published name by @maker · Sidework');
  assert.equal(metadata.description, 'The published purpose.');
  assert.equal(metadata.canonical, `https://sidework.example/showcase/${slug}/`);
  assert.equal(metadata.image, `${metadata.canonical}?image=share`);
  assert.equal(metadata.imageWidth, 1200);
  assert.equal(metadata.imageHeight, 630);
  assert.equal(showcaseMetadata(null, slug, 'https://sidework.example'), null);
  assert.equal(showcaseMetadata(content, '../private', 'https://sidework.example'), null);
});

test('copy remains usable when the clipboard is absent or rejects permission', async () => {
  for (const navigator of [{}, { clipboard: { writeText: async () => { throw new Error('denied'); } } }]) {
    const dom = controls(), doc = dom.window.document;
    initializeShowcaseSharing(doc, navigator);
    const copy = doc.querySelector('#copy-showcase-link'), link = doc.querySelector('input');
    assert.equal(copy.hidden, false);
    copy.click(); await settle();
    assert.equal(doc.activeElement, link);
    assert.equal(link.selectionStart, 0);
    assert.equal(link.selectionEnd, link.value.length);
    assert.match(doc.querySelector('[role=status]')?.textContent || doc.querySelector('p').textContent, /Link selected/);
    assert.equal(doc.querySelector('p').hidden, false);
    dom.window.close();
  }
});

test('copy and native share use the actual public link and snapshot title', async () => {
  const dom = controls(), doc = dom.window.document;
  const copied = [], shared = [];
  initializeShowcaseSharing(doc, { clipboard: { writeText: async value => copied.push(value) }, share: async value => shared.push(value) });
  doc.querySelector('#copy-showcase-link').click(); await settle();
  assert.deepEqual(copied, [doc.querySelector('input').value]);
  assert.match(doc.querySelector('p').textContent, /copied/);
  const share = doc.querySelector('#share-showcase-link');
  assert.equal(share.hidden, false);
  share.click(); await settle();
  assert.deepEqual(shared, [{ title: 'Published name by @maker', url: doc.querySelector('input').value }]);
  dom.window.close();
});

test('canceling native share does not report an error or a successful share', async () => {
  const dom = controls(), doc = dom.window.document;
  initializeShowcaseSharing(doc, { share: async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); } });
  doc.querySelector('#share-showcase-link').click(); await settle();
  assert.equal(doc.querySelector('p').hidden, true);
  dom.window.close();
});
