const should = require('should');
const path = require('path');

const bounds = require('../lib/bounds');

describe('bounds', function () {
  it('should extract bounds for file', function () {
    const file = path.resolve(__dirname, 'fixtures', 'data', 'srmt-250m_13_3.tif');

    return bounds(file)
      .then(bounds => {
        should.exist(bounds);
        bounds.should.eql({
          minX: -107.00208331573002,
          maxX: -106.00208331733002,
          minY: 40.408333172679995,
          maxY: 40.808333172039994,
          file,
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

        });
      });
  });
});
