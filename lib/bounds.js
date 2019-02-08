const { fromFile } = require('geotiff');
const inverseTransform = require('./inverse-transform');

module.exports = bounds;

function bounds(file) {
  function convert(img) {

    const { fileDirectory } = img;

    const width = fileDirectory.ImageWidth;
    const height = fileDirectory.ImageLength;
    const isTiled = !fileDirectory.StripOffsets;

    const tileWidth = isTiled ? fileDirectory.TileWidth : width;
    let tileHeight = height;
    if (isTiled) {
      tileHeight = fileDirectory.tileHeight;
    } else if (typeof fileDirectory.RowsPerStrip !== 'undefined') {
      tileHeight = Math.min(fileDirectory.RowsPerStrip, height);
    }

    const [ minX, minY, maxX, maxY ] = img.getBoundingBox();

    return {
      minX,
      maxX,
      minY,
      maxY,
      file,
      meta: {
        width,
        height,
        tileWidth,
        tileHeight,
        tilesPerRow: Math.ceil(width / tileWidth),
        tilesPerCol: Math.ceil(height / tileHeight),
        littleEndian: img.littleEndian,
        offsets: isTiled ? fileDirectory.TileOffsets : fileDirectory.StripOffsets,
        byteCounts: isTiled ? fileDirectory.TileByteCounts : fileDirectory.StripByteCounts,
        it: inverseTransform(img)
      }
    };
  }

  return fromFile(file)
    .then(geotiff => geotiff.getImage())
    .then(convert);
}
