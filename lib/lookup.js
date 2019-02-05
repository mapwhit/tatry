const { fromFile } = require('geotiff');

module.exports = init;


function createInvTransformMatrix(img) {
  const { ModelPixelScale: scale, ModelTiepoint: tiepoint } = img.getFileDirectory();


  const x = tiepoint[3];
  const y = tiepoint[4];

  const t = [
    x,
    scale[0],
    0,
    y,
    0,
    - scale[1]
  ];
  const inverse = [
    - t[0] / t[1],
    1 / t[1],
    0,
    - t[3] / t[5],
    0,
    1 / t[5]
  ];

  return inverse;

}

function project(img, ll) {
  const t = createInvTransformMatrix(img);

  const x = Math.floor(t[0] + ll[0] * t[1]);
  const y = Math.floor(t[3] + ll[1] * t[5]);


  return [ x, y ];
}


function findInImage(img, ll) {
  // console.log(ll);
  const point = project(img, ll);
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


function init({ fileBag }) {

  function lookup(ll) {

    const file = fileBag.find(ll);

    return fromFile(file)
      .then(geotiff => geotiff.getImage())
      .then(img => findInImage(img, ll));

  }

  return {
    lookup
  };
}
