const { fromFile } = require('geotiff');
const inverseTransform = require('./inverse-transform');

module.exports = bounds;

function bounds(file) {
  function convert(img) {
    const [ minX, minY, maxX, maxY ] = img.getBoundingBox();
    return {
      minX,
      maxX,
      minY,
      maxY,
      file,
      meta: {
        width: img.getWidth(),
        height: img.getHeight(),
        it: inverseTransform(img)
      }
    };
  }

  return fromFile(file)
    .then(geotiff => geotiff.getImage())
    .then(convert);
}
