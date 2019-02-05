const should = require('should');
const bounds = require('../lib/bounds');

describe('bounds', function () {
  it('should extract bounds for file', function () {

    return bounds('/var/lib/tatry/SRTM_W_250m_4_3.tif')
      .then(bounds => {
        should.exist(bounds);
        bounds.should.eql({
            minX: -120.00208329493002,
            maxX: -104.99999998560001,
            minY: 36.00624984639,
            maxY: 42.00833317012,
            file: '/var/lib/tatry/SRTM_W_250m_4_3.tif'
        });
      });
  });
});
