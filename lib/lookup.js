const { fromFile } = require('geotiff');
const transformMatrix = require('./inverse-transform.js');

module.exports = init;

const INVALID_ELEVATION = -32768;

function project(t, ll) {
  const x = Math.floor(t[0] + ll[0] * t[1]);
  const y = Math.floor(t[3] + ll[1] * t[5]);

  return [ x, y ];
}

function findInImage(img, ll) {
  // console.log(ll);
  const tm = transformMatrix(img);
  const point = project(tm, ll);
  // console.log('Transformed:', point);

  // TODO: use bilinear interpolation to calculate: https://en.wikipedia.org/wiki/Bilinear_interpolation
  return img.readRasters({
    samples: [ 0 ],
    window: [
      point[0],
      point[1],
      point[0] + 2,
      point[1] + 2
    ]
  })
  .then(r => r[0][0]);
}

function promiseFindInImage(promiseImage, ll) {
  return promiseImage.then(img => findInImage(img, ll));
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
      let file = fileBag.find(lls[i]);
      if (!file) {
        results[i] = INVALID_ELEVATION;
        continue;
      }
      if (file !== prevFile) {
        imagePromise = fromFile(file).then(geotiff => geotiff.getImage());
        prevFile = file;
      }
      results[i] = promiseFindInImage(imagePromise, lls[i]);
    }

    return Promise.all(results);
  }

  return {
    lookup
  };
}
