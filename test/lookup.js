const should = require('should');
const path = require('path');

const makeFileBag = require('../lib/file-bag');
const makeLookup = require('../lib/lookup');

const data = [
  {
    minX: -107.00208331573002,
    maxX: -106.00208331733002,
    minY: 40.408333172679995,
    maxY: 40.808333172039994,
    file: path.resolve(__dirname, 'fixtures', 'data', 'srmt-250m_13_3.tif'),
    meta: {
      width: 480,
      height: 192,
      it: [
        51361.000073728006,
        480.00000076799995,
        0,
        19587.999953919996,
        0,
        -480.00000076799995
      ]
    }
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
    const pointB = [ -106.1, 40.5 ];
    const pointC = [ -106.9, 40.8 ];

    return lookup([ pointA, pointB, pointC ]).then(result => {
      should.exist(result);
      result.should.eql([ 2068, 3045, 2512 ]);
    });
  });

  it('find a multiple points - some invalid', function () {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const pointA = [ -106.827126, 40.483468 ];
    const pointB = [ -110, 44 ]; // invalid point - outside range
    const pointC = [ -106.9, 40.8 ];

    return lookup([ pointA, pointB, pointC ]).then(result => {
      should.exist(result);
      result.should.eql([
        2068,
        -32768, // invalid elevation
        2512
      ]);
    });
  });

});
