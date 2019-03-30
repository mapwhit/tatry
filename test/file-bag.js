const test = require('tape');
const fileBag = require('../lib/file-bag');


test('file bag', function (t) {

  t.test('find file for valid point', function (t) {

    const data = require('./fixtures/data-with-meta/tatry.json');
    const fb = fileBag(data);

    const { file, meta } = fb.find([ -106.827126, 40.483468 ]);
    t.equal(file, '/var/lib/tatry/srmt-250m_13_3.tif');

    t.equal(meta.width, 480);
    t.equal(meta.height, 192);
    t.equal(meta.it.length, 6);
    t.end();
  });

  t.test('find file with best resolution', function (t) {

    const data = require('./fixtures/data-with-meta/tatry-resolution.json');
    const fb = fileBag(data);

    const { file, meta } = fb.find([ -106.827126, 40.483468 ]);
    t.equal(file, '/var/lib/tatry/srmt-60m_13_3.tif');

    t.equal(meta.width, 480);
    t.equal(meta.height, 192);
    t.equal(meta.it.length, 6);
    t.end();
  });

});
