const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const metas = require('../lib/metas');

test('metas should extract metas from directory', async function () {
  const dir = path.resolve(__dirname, 'fixtures', 'data');

  const data = await metas(dir);
  assert(data);
  assert.equal(data.length, 2);
});
