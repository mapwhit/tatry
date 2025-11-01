import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import metas from '../lib/metas.js';

test('metas should extract metas from directory', async () => {
  const dir = path.resolve(import.meta.dirname, 'fixtures', 'data');

  const data = await metas(dir);
  assert(data);
  assert.equal(data.length, 2);
});
