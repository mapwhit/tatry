const { fromFile } = require('geotiff');

const interpolate = require('./interpolate');

module.exports = init;

const { INVALID_ELEVATION } = interpolate;

const decoder = {
  decode: (_, buffer) => buffer
};

/* exported newRead */
function newRead(img, imageWindow) {
  const valueArrays = new Int16Array(4);
  return img._readRaster(
    imageWindow, [ 0 ], [ valueArrays ], false, decoder
  );
}

/* exported oldRead */
function oldRead(img, imageWindow) {
  return img.readRasters({
    samples: [ 0 ],
    window: imageWindow
  });
}

function findInImage(img, { it }, ll) {

  const x = it[0] + ll[0] * it[1];
  const y = it[3] + ll[1] * it[5];

  const minX = Math.floor(x);
  const minY = Math.floor(y);

  return newRead( img, [minX, minY, minX + 2, minY + 2 ]).then(r => {
    let v = interpolate([ x, y ], [ minX, minY, minX + 1, minY + 1 ], r[0]);
    return Math.round(v * 2) / 2; // round to 0.5m
  });
}

function promiseFindInImage(promiseImage, meta, ll) {
  return promiseImage.then(img => findInImage(img, meta, ll));
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

    let prevFile;
    let area;
    let imagePromise;

    const results = lls.map(ll => {
      if (isInArea(area, ll)) {
        return promiseFindInImage(imagePromise, area.meta, ll);
      }

      area = fileBag.find(ll);
      const { file, meta } = area;

      if (!file) {
        return INVALID_ELEVATION;
      }

      if (file !== prevFile) {
        imagePromise = fromFile(file).then(geotiff => geotiff.getImage());
        prevFile = file;
      }

      return promiseFindInImage(imagePromise, meta, ll);
    });

    return Promise.all(results);
  }

  return {
    lookup
  };
}
