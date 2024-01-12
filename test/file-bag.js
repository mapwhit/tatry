const test = require('node:test');
const assert = require('node:assert/strict');
const fileBag = require('../lib/file-bag');


test('file bag', async function (t) {

  await t.test('find file for valid point', function () {

    const data = require('./fixtures/data-with-meta/tatry.json');
    const fb = fileBag(data);

    const { file, meta } = fb.find([-106.827126, 40.483468]);
    assert.equal(file, '/var/lib/tatry/srmt-250m_13_3.tif');

    assert.equal(meta.width, 480);
    assert.equal(meta.height, 192);
    assert.equal(meta.it.length, 6);
  });

  await t.test('find file with best resolution', function () {

    const data = require('./fixtures/data-with-meta/tatry-resolution.json');
    const fb = fileBag(data);

    const { file, meta } = fb.find([-106.827126, 40.483468]);
    assert.equal(file, '/var/lib/tatry/srmt-60m_13_3.tif');

    assert.equal(meta.width, 480);
    assert.equal(meta.height, 192);
    assert.equal(meta.it.length, 6);
  });
});
