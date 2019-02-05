const { fromFile } = require('geotiff');

module.exports = bounds;

function bounds(file) {
  function convert([ minX, minY, maxX, maxY ]) {
    return {
      minX,
      maxX,
      minY,
      maxY,
      file
    };
  }

  return fromFile(file)
    .then(geotiff => geotiff.getImage())
    .then(img => img.getBoundingBox())
    .then(convert);
}
