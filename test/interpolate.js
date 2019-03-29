const test = require('tape');
const interpolate = require('../lib/interpolate');


test('interpolate should calculate bilinear interpolation', function (t) {
  function approx(a, b, e, msg = `${a} should differ from ${b} by no more than ${e}`) {
    t.ok(Math.abs(a - b) < e, msg);
  }

  let window = [
    14, 20,
    15, 21
  ];
  let point = [ 14.5, 20.2 ];
  let values = [
    91, 210,
    162, 95
  ];

  t.plan(1);
  let v = interpolate(point, window, values);
  approx(v, 146.1, 0.000000001);
});
