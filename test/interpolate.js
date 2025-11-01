import assert from 'node:assert/strict';
import test from 'node:test';
import interpolate from '../lib/interpolate.js';

test('interpolate should calculate bilinear interpolation', function () {
  function approx(a, b, e, msg = `${a} should differ from ${b} by no more than ${e}`) {
    assert(Math.abs(a - b) < e, msg);
  }

  const window = [14, 20, 15, 21];
  const point = [14.5, 20.2];
  const values = [91, 210, 162, 95];

  const v = interpolate(point, window, values);
  approx(v, 146.1, 0.000000001);
});
