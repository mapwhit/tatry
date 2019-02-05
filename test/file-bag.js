const should = require('should');
const fileBag = require('../lib/file-bag');

const data = require('/var/lib/tatry/summary.json');

describe('file bag', function () {
  it('find valid point', function () {

    const fb = fileBag(data);

    const file = fb.find([ -106.827126, 40.483468 ]);
    should.exist(file);
    file.should.eql('data/SRTM_W_250m_4_3.tif');
  });
});
