module.exports = interpolate;

// see: https://en.wikipedia.org/wiki/Bilinear_interpolation
function interpolate([x, y], [minX, minY, maxX, maxY], values) {

  const q0 = (maxX - x) * (maxY - y);
  const q1 = (x - minX) * (maxY - y);
  const q2 = (maxX - x) * (y - minY);
  const q3 = (x - minX) * (y - minY);

  return values[0] * q0 + values[1] * q1 + values[2] * q2 + values[3] * q3;
}
