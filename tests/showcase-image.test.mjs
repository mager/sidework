import assert from 'node:assert/strict';
import test from 'node:test';
import { showcaseImageResponse, showcaseImageTree } from '../src/lib/showcase-image.mjs';

const content = { handle: '@builder', project: { name: 'A useful little tool', tagline: 'Make room for your next idea.', description: 'A published description.', image: 'https://private.invalid/never-fetch.png', whyBuilt: 'Private motivation' }, favorites: [] };

test('share image uses only the public project identity and text, never screenshot URLs or private fields', () => {
  const tree = JSON.stringify(showcaseImageTree(content));
  assert.match(tree, /A useful little tool/);
  assert.match(tree, /@builder/);
  assert.match(tree, /Make room for your next idea/);
  assert.doesNotMatch(tree, /private\.invalid|Private motivation|whyBuilt|<img/);
  assert.match(JSON.stringify(showcaseImageTree({ handle: '@builder', project: { name: '<script>alert(1)</script>', description: 'Just text.' } })), /<script>/);
});

test('share response renders an actual 1200 by 630 PNG without fetching the author screenshot', async () => {
  const response = await showcaseImageResponse(content);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/png');
  assert.match(response.headers.get('cache-control'), /no-store/);
  const png = Buffer.from(await response.arrayBuffer());
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test('HEAD images have no body and an absent published projection produces no image', async () => {
  const head = await showcaseImageResponse(content, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-type'), 'image/png');
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const missing = await showcaseImageResponse(null);
  assert.equal(missing.status, 404);
  assert.doesNotMatch(missing.headers.get('content-type') || '', /image/);
});
