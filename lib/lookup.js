const interpolate = require('./interpolate');
const lameTiff = require('./lame-tiff');

module.exports = init;

const { INVALID_ELEVATION } = interpolate;

async function findInImage(tiff, { it, width, height }, ll) {

  const x = it[0] + ll[0] * it[1];
  const y = it[3] + ll[1] * it[5];

  const minX = Math.floor(x);
  const minY = Math.floor(y);

  let v;

  if (minX + 2 > width || minY + 2 > height) {
    // read only one point
    const values = await tiff.readRaster( minX, minY, 1, 1 );
    v = values[0];
  } else {
    const values = await tiff.readRaster( minX, minY, 2, 2 );
    v = interpolate([ x, y ], [ minX, minY, minX + 1, minY + 1 ], values);
  }

  return Math.round(v * 2) / 2; // round to 0.5m
}

function isInArea(area, [x, y]) {
  if (!area) {
    return;
  }
  let { minX, maxX, minY, maxY } = area;
  return minX <= x && x < maxX && minY < y && y < maxY;
}

function init({ fileBag }) {

  function lookup(lls) {

    if (lls.length === 0) {
      return [];
    }

    let file;
    let area;
    let tiff;

    const results = lls.map(ll => {
      if (isInArea(area, ll)) {
        return findInImage(tiff, area.meta, ll);
      }

      area = fileBag.find(ll);
      if (!area) {
        return INVALID_ELEVATION;
      }

      if (file !== area.file) {
        tiff = lameTiff(area.file, area.meta);
        file = area.file;
      }

      return findInImage(tiff, area.meta, ll);
    });

    return Promise.all(results);
  }

  return {
    lookup
  };
}
