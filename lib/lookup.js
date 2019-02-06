const { fromFile } = require('geotiff');

const interpolate = require('./interpolate');

module.exports = init;

const INVALID_ELEVATION = -32768;

function findInImage(img, { it }, ll) {

  const x = it[0] + ll[0] * it[1];
  const y = it[3] + ll[1] * it[5];

  const minX = Math.floor(x);
  const minY = Math.floor(y);

  return img.readRasters({
    samples: [ 0 ],
    window: [
      minX,
      minY,
      minX + 2,
      minY + 2
    ]
  })
  .then(r => {
    let v = interpolate([ x, y ], [ minX, minY, minX + 1, minY + 1 ], r[0]);
    return Math.round(v * 2) / 2; // round to 0.5m
  });
}

function promiseFindInImage(promiseImage, meta, ll) {
  return promiseImage.then(img => findInImage(img, meta, ll));
}

function init({ fileBag }) {


  function lookup(lls) {

    if (lls.length === 0) {
      return [];
    }

    const results = new Array(lls.length);

    let prevFile;
    let imagePromise;
    for(let i = 0; i < lls.length; i++) {
      let { file, meta } = fileBag.find(lls[i]);
      if (!file) {
        results[i] = INVALID_ELEVATION;
        continue;
      }
      if (file !== prevFile) {
        imagePromise = fromFile(file).then(geotiff => geotiff.getImage());
        prevFile = file;
      }
      results[i] = promiseFindInImage(imagePromise, meta, lls[i]);
    }

    return Promise.all(results);
  }

  return {
    lookup
  };
}
