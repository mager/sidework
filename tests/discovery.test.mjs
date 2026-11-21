import assert from 'node:assert/strict';
import test from 'node:test';
import { discoverDevelopers } from '../src/data/discovery.mjs';

test('Explore omits the signed-in developer by verified GitHub ID', () => {
  const developers = discoverDevelopers();
  assert.ok(developers.length > 1);
  for (const developer of developers) {
    assert.deepEqual(
      discoverDevelopers(developer.githubId),
      developers.filter(item => item.githubId !== developer.githubId),
    );
  }
  assert.deepEqual(discoverDevelopers('17733'), developers);
});
