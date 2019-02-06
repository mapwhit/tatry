const should = require('should');
const fileBag = require('../lib/file-bag');

const data = require('./fixtures/data-with-meta/tatry.json');

describe('file bag', function () {
  it('find valid point', function () {

    const fb = fileBag(data);

    const { file, meta } = fb.find([ -106.827126, 40.483468 ]);
    should.exist(file);
    file.should.eql('/var/lib/tatry/srmt-250m_13_3.tif');

    should.exist(meta);
    meta.should.have.property('width', 480);
    meta.should.have.property('height', 192);
    meta.should.have.property('it').with.length(6);
  });
});
