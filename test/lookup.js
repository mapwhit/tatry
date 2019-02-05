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
  it('find a single point', function () {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const point = [ -106.827126, 40.483468 ];

    return lookup([ point ]).then(result => {
      should.exist(result);
      result.should.eql([ 2068 ]);
    });
  });

  it('find a multiple points', function () {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const pointA = [ -106.827126, 40.483468 ];
    const pointB = [ -110, 41 ];
    const pointC = [ -112, 39 ];

    return lookup([ pointA, pointB, pointC ]).then(result => {
      should.exist(result);
      result.should.eql([ 2068, 2275, 1906 ]);
    });
  });

  it('find a multiple points - some invalid', function () {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const pointA = [ -106.827126, 40.483468 ];
    const pointB = [ -110, 44 ]; // invalid point - outside range
    const pointC = [ -112, 39 ];

    return lookup([ pointA, pointB, pointC ]).then(result => {
      should.exist(result);
      result.should.eql([
        2068,
        -32768, // invalid elevation
        1906
      ]);
    });
  });

});
