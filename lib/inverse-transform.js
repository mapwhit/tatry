module.exports = createInverseTransformMatrix;

function createInverseTransformMatrix(img) {
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
