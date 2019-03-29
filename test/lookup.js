const test = require('tape');
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
      littleEndian: true,
      height: 192,
      width: 480,
      tileHeight: 8,
      tileWidth: 480,
      tilesPerCol: 24,
      tilesPerRow: 1,
      byteCounts: Uint32Array.from([ 7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680,7680 ]),
      offsets: Uint32Array.from([ 578, 8258, 15938, 23618, 31298, 38978, 46658, 54338, 62018, 69698, 77378, 85058, 92738, 100418, 108098, 115778, 123458, 131138, 138818, 146498, 154178, 161858, 169538, 177218 ]),
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

test('lookup', function (t) {
  t.test('find a single point', async function (t) {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const point = [ -106.827126, 40.483468 ];

    t.plan(1);
    const result = await lookup([ point ]);
    t.same(result, [ 2082.5 ]);
  });

  t.test('find a multiple points', async function (t) {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const pointA = [ -106.827126, 40.483468 ];
    const pointB = [ -106.1, 40.5 ];
    const pointC = [ -106.9, 40.8 ];

    t.plan(1);
    const result = await lookup([ pointA, pointB, pointC ]);
    t.same(result, [ 2082.5, 3065, 2474 ]);
  });

  t.test('find a multiple points - some invalid', async function (t) {

    const fileBag = makeFileBag(data);
    const { lookup } = makeLookup({ fileBag });

    const pointA = [ -106.827126, 40.483468 ];
    const pointB = [ -110, 44 ]; // invalid point - outside range
    const pointC = [ -106.9, 40.8 ];

    t.plan(1);
    const result = await lookup([ pointA, pointB, pointC ]);
    t.same(result, [
      2082.5,
      -32768, // invalid elevation
      2474
    ]);
  });

});
