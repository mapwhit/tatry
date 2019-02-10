/* small subset of TIFF tags that we need to parse */

const fieldTagNames = {
  // TIFF Baseline
  0x0102: 'BitsPerSample',
  0x0103: 'Compression',
  0x0101: 'ImageLength',
  0x0100: 'ImageWidth',
  0x0115: 'SamplesPerPixel',
  0x0116: 'RowsPerStrip',
  0x0117: 'StripByteCounts',
  0x0111: 'StripOffsets',
  0x011C: 'PlanarConfiguration',
  0x0153: 'SampleFormat',

  // TIFF Extended
  0x0145: 'TileByteCounts',
  0x0143: 'TileLength',
  0x0144: 'TileOffsets',
  0x0142: 'TileWidth',

  // GeoTiff
  0x830E: 'ModelPixelScale',
  0x8482: 'ModelTiepoint',
  0x85D8: 'ModelTransformation',
};

const fieldTypeMap = {
  0x0001: { len: 1, type:   'Uint8' },            // BYTE
  0x0002: { len: 1, type:   'Uint8', str: true }, // ASCII
  0x0003: { len: 2, type:  'Uint16' },            // SHORT
  0x0004: { len: 4, type:  'Uint32' },            // LONG
  0x0005: { len: 8, type:  'Uint32', count: 2 },  // RATIONAL
  0x0006: { len: 1, type:    'Int8' },            // SBYTE
  0x0007: { len: 1, type:   'Uint8' },            // UNDEFINED
  0x0008: { len: 2, type:   'Int16' },            // SSHORT
  0x0009: { len: 4, type:   'Int32' },            // SLONG
  0x000A: { len: 8, type:   'Int32', count: 2 },  // SRATIONAL
  0x000B: { len: 4, type: 'Float32' },            // FLOAT
  0x000C: { len: 8, type: 'Float64' },            // DOUBLE
};

Object.values(fieldTypeMap).forEach(ft => ft.getFn = DataView.prototype[`get${ft.type}`]);

module.exports = {
  fieldTagNames,
  fieldTypeMap
};

