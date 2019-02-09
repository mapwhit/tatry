const { promises: { open }, constants: { O_RDONLY } } = require('fs');

module.exports = lameTiff;

function lameTiff(filename, meta) {
  const bytesPerPixel = 2;

  const {
    tileWidth,
    tileHeight,
    tilesPerCol,
    tilesPerRow,
    littleEndian,
    offsets,
    byteCounts
  } = meta;

  const readInt16Fn = littleEndian ? Buffer.prototype.readInt16LE : Buffer.prototype.readInt16BE;

  function readInt16(buffer, offset) {
    return readInt16Fn.call(buffer, offset);
  }

  return {
    readRaster
  };

  function readRaster(windowX, windowY, windowWidth, windowHeight) {
    const valueArray = new Int16Array(windowWidth * windowHeight);

    const minXTile = Math.max(Math.floor(windowX / tileWidth), 0);
    const maxXTile = Math.min(Math.ceil((windowX + windowWidth) / tileWidth), tilesPerRow);

    const minYTile = Math.max(Math.floor(windowY / tileHeight), 0);
    const maxYTile = Math.min(Math.ceil((windowY + windowHeight) / tileHeight), tilesPerCol);

    const promises = [];

    for (let yTile = minYTile; yTile < maxYTile; ++yTile) {
      const baseIndex = yTile * tilesPerRow;
      const firstLine = yTile * tileHeight;

      for (let xTile = minXTile; xTile < maxXTile; ++xTile) {
        const firstCol = xTile * tileWidth;

        promises.push(processTile(baseIndex + xTile, firstCol, firstLine));
      }
    }

    return Promise.all(promises).then(() => valueArray);

    function processTile(index, firstCol, firstLine) {
      const offset = offsets[index];
      const byteCount = byteCounts[index];

      return readFromFile(offset, byteCount).then(data => dataFromTile(data, firstCol, firstLine));
    }

    function dataFromTile({ buffer }, firstCol, firstLine) {
      for(let l = 0; l < windowHeight; l++) {
        const line = l + windowY - firstLine;
        if (line < 0 || line >= tileHeight) {
          continue;
        }
        for (let c = 0; c < windowWidth; c++) {
          const column = c + windowX - firstCol;
          if (column < 0 || column >= tileWidth) {
            continue;
          }
          const pixelOffset = column + line * tileWidth;
          valueArray[c + l * windowWidth] = readInt16(buffer, pixelOffset * bytesPerPixel);
        }
      }
    }
  }

  function readFromFile(offset, byteCount) {
    meta.fh = meta.fh || open(filename, O_RDONLY);

    const buffer = Buffer.allocUnsafe(byteCount);
    return meta.fh.then(fh => fh.read(buffer, 0, byteCount, offset));
  }
}
