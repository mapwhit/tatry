import assert from 'node:assert/strict';
import test from 'node:test';
import fileBag from '../lib/file-bag.js';

test('file bag', async t => {
  await t.test('find file for valid point', async () => {
    const { default: data } = await import('./fixtures/data-with-meta/tatry.json', { with: { type: 'json' } });
    const fb = fileBag(data);

    const { file, meta } = fb.find([-106.827126, 40.483468]);
    assert.equal(file, '/var/lib/tatry/srmt-250m_13_3.tif');

    assert.equal(meta.width, 480);
    assert.equal(meta.height, 192);
    assert.equal(meta.it.length, 6);
  });

  await t.test('find file with best resolution', async () => {
    const { default: data } = await import('./fixtures/data-with-meta/tatry-resolution.json', {
      with: { type: 'json' }
    });
    const fb = fileBag(data);

    const { file, meta } = fb.find([-106.827126, 40.483468]);
    assert.equal(file, '/var/lib/tatry/srmt-60m_13_3.tif');

    assert.equal(meta.width, 480);
    assert.equal(meta.height, 192);
    assert.equal(meta.it.length, 6);
  });
});
