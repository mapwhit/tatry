const { parse } = require('./lame-tiff/file');

module.exports = bounds;

async function bounds(file) {
  function convert({ fileDirectory, littleEndian }) {

    check(fileDirectory);

    const { ImageWidth: width , ImageLength: height } = fileDirectory;
    const isTiled = !fileDirectory.StripOffsets;

    const tileWidth = isTiled ? fileDirectory.TileWidth : width;
    let tileHeight = height;
    if (isTiled) {
      tileHeight = fileDirectory.tileHeight;
    } else if (typeof fileDirectory.RowsPerStrip !== 'undefined') {
      tileHeight = Math.min(fileDirectory.RowsPerStrip, height);
    }

    const { minX, minY, maxX, maxY } = getBoundingBox(fileDirectory);

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
        littleEndian: littleEndian,
        offsets: isTiled ? fileDirectory.TileOffsets : fileDirectory.StripOffsets,
        byteCounts: isTiled ? fileDirectory.TileByteCounts : fileDirectory.StripByteCounts,
        it: getInverseTransformMatrix(fileDirectory)
      }
    };
  }

  let data = await parse(file);
  try {
    return convert(data);
  } finally {
    data.fh.close();
  }
}

function check(fileDirectory) {
  function checkProperty(name, expected) {
    if (name in fileDirectory && fileDirectory[name] !== expected) {
      throw new Error(`Invalid ${name}: expected: ${expected}, got: ${fileDirectory[name]}`);
    }
  }

  checkProperty('BitsPerSample', 16);
  checkProperty('Compression', 1);
  checkProperty('SamplesPerPixel', 1);
  checkProperty('PlanarConfiguration', 1);
  checkProperty('SampleFormat', 2);
}

function getOrigin(fileDirectory) {
  const { ModelTiepoint: tp, ModelTransformation: mt } = fileDirectory;

  if (tp && tp.length === 6) {
    return [ tp[3], tp[4], tp[5] ];
  } else if (mt) {
    return [ mt[3], mt[7], mt[11]];
  }

  throw new Error('Cannot calculated origin.');
}

function getResolution(fileDirectory) {
  const { ModelPixelScale: ps, ModelTransformation: mt } = fileDirectory;

  if (ps) {
    return [ ps[0], -ps[1], ps[2] ];
  } else if (mt) {
    return [ mt[0], mt[5], mt[10] ];
  }

  throw new Error('Cannot calculate resolution.');
}

function getBoundingBox(fileDirectory) {
  const origin = getOrigin(fileDirectory);
  const resolution = getResolution(fileDirectory);

  const x = origin[0];
  const width = resolution[0] * fileDirectory.ImageWidth;
  const xx = width > 0 ? [ x, x + width ] : [ x + width, x ];

  const y = origin[1];
  const height = resolution[1] * fileDirectory.ImageLength;
  const yy = height > 0 ? [ y, y + height ] : [ y + height, y ];

  return {
    minX: xx[0],
    minY: yy[0],
    maxX: xx[1],
    maxY: yy[1],
  };
}

function getInverseTransformMatrix(fileDirectory) {
  const { ModelPixelScale: scale, ModelTiepoint: tiepoint } = fileDirectory;

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
