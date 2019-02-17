const { promises: { open }, constants: { O_RDONLY } } = require('fs');
const { INVALID_ELEVATION } = require('../interpolate');
const cache = require('./cache');

const debug = require('debug')('tatry:lame-tiff');

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

  debug('%s - width: %d, height: %d', filename, meta.width, meta.height);
  debug('tileWidth: %d, tileHeight: %d, tilesPerCol: %d, tilesPerRow: %d',
      tileWidth, tileHeight, tilesPerCol, tilesPerRow);

  const readInt16Fn = littleEndian ? Buffer.prototype.readInt16LE : Buffer.prototype.readInt16BE;

  function readInt16(buffer, offset) {
    return readInt16Fn.call(buffer, offset);
  }

  async function readRaster(windowX, windowY, windowWidth, windowHeight) {
    const valueArray = new Int16Array(windowWidth * windowHeight);
    valueArray.fill(INVALID_ELEVATION);

    async function processTile(index, firstCol, firstLine) {

      let buffer = cache.get(filename, index);
      if (!buffer) {
        debug('cache miss %s:%d', filename, index);
        const offset = offsets[index];
        const byteCount = byteCounts[index];
        buffer = await readFromFile(byteCount, offset);
        cache.put(filename, index, buffer);
      }

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
          const offset = pixelOffset * bytesPerPixel;
          if (debug.enabled) {
            if (offset >= buffer.length) {
              throw new RangeError(`Trying to read beyond buffer in ${filename} [${windowX}, ${windowY}]`);
            }
          }
          valueArray[c + l * windowWidth] = readInt16(buffer, offset);
        }
      }
    }

    debug('Window %d %d %d %d', windowX, windowY, windowWidth, windowHeight);

    const minXTile = Math.floor(windowX / tileWidth);
    const minYTile = Math.floor(windowY / tileHeight);

    const maxXTile = Math.floor((windowX + windowWidth - 1) / tileWidth);
    const maxYTile = Math.floor((windowY + windowHeight - 1) / tileHeight);

    debug('minXTile: %d, minYTile: %d, maxXTile: %d, maxYTile: %d',
      minXTile, minYTile, maxXTile, maxYTile);

    const promises = [];

    for (let yTile = minYTile; yTile <= maxYTile; ++yTile) {
      const baseIndex = yTile * tilesPerRow;
      const firstLine = yTile * tileHeight;

      for (let xTile = minXTile; xTile <= maxXTile; ++xTile) {
        const firstCol = xTile * tileWidth;
        promises.push(processTile(baseIndex + xTile, firstCol, firstLine));
      }
    }

    await Promise.all(promises);
    return valueArray;
  }

  async function readFromFile(length, position) {
    meta.fh = meta.fh || open(filename, O_RDONLY);

    const b = Buffer.allocUnsafe(length);
    const fh = await meta.fh;
    const { buffer, bytesRead } = await fh.read(b, 0, length, position);
    if (bytesRead !== length) {
      throw new RangeError(`Requested ${length}, Read: ${bytesRead}`);
    }
    return buffer;
  }

  return {
    readRaster
  };
}
