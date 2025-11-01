export const INVALID_ELEVATION = -32768;

// see: https://en.wikipedia.org/wiki/Bilinear_interpolation
export default function interpolate([x, y], [minX, minY, maxX, maxY], values) {
  // do not interpolate if we got INVALID_ELEVATION anywhere
  for (let i = 0; i < values.length; i++) {
    if (values[i] === INVALID_ELEVATION) {
      return values[0];
    }
  }

  const q0 = (maxX - x) * (maxY - y);
  const q1 = (x - minX) * (maxY - y);
  const q2 = (maxX - x) * (y - minY);
  const q3 = (x - minX) * (y - minY);

  return values[0] * q0 + values[1] * q1 + values[2] * q2 + values[3] * q3;
}
