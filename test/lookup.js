const should = require('should');
const makeFileBag = require('../lib/file-bag');
const makeLookup = require('../lib/lookup');

const data = [
  {
    coords: [
      36.00624984639,
      42.00833317012,
      -120.00208329493002,
      -104.99999998560001
    ],
    file: '/var/lib/tatry/SRTM_W_250m_4_3.tif'
  }
];

describe('lookup', function () {
  it('find valid point', function () {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    return lookup([ -106.827126, 40.483468 ]).then(result => {
      should.exist(result);
      result.should.eql(2068);
    });
  });
});
