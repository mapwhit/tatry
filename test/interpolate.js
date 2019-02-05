const interpolate = require('../lib/interpolate');

describe('interpolate', function () {
  it('should calculate bilinear interpolation', function () {
    let window = [
      14, 20,
      15, 21
    ];
    let point = [ 14.5, 20.2 ];
    let values = [
      91, 210,
      162, 95
    ];

    let v = interpolate(point, window, values);
    v.should.be.approximately(146.1, 0.000000001);
  });
});
