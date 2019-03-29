const test = require('tape');
const path = require('path');

const metas = require('../lib/metas');

test('metas should extract metas from directory', async function (t) {

  const dir = path.resolve(__dirname, 'fixtures', 'data');

  t.plan(2);

  const data = await metas(dir);
  t.ok(data);
  t.equal(data.length, 2);
});
