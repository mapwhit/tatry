const {
  promises: { open },
  constants: { O_RDONLY }
} = require('node:fs');
const { fieldTagNames, fieldTypeMap } = require('./constants');

module.exports = {
  parse,
  header,
  ifd
};

async function read(fh, length, position = 0) {
  const buffer = Buffer.allocUnsafe(length);
  const { bytesRead } = await fh.read(buffer, 0, length, position);
  if (bytesRead !== length) {
    throw new RangeError(`Requested ${length}, Read: ${bytesRead}`);
  }
  return new DataView(buffer.buffer, buffer.byteOffset, bytesRead);
}

async function parse(filename) {
  const fh = await open(filename, O_RDONLY);
  const fileHeader = await header(fh);
  const entries = await ifd(fileHeader);

  const fileDirectory = entries.reduce((o, { name, value }) => {
    o[name] = value;
    return o;
  }, {});
  return {
    fh,
    fileDirectory,
    littleEndian: fileHeader.littleEndian
  };
}

async function header(fh) {
  const dv = await read(fh, 8);

  const littleEndian = dv.getUint16(0) === 0x4949;

  const versionNumber = dv.getUint16(2, littleEndian);
  if (versionNumber !== 42) {
    throw new Error(`Not a TIFF file: ${versionNumber}`);
  }

  return {
    fh,
    littleEndian,
    ifdOffset: dv.getUint32(4, littleEndian)
  };
}

const IFD_ENTRY_SIZE = 12; // word, word, double word, double word

async function ifd({ fh, littleEndian, ifdOffset }) {
  const dv = await read(fh, 2, ifdOffset);
  const count = dv.getUint16(0, littleEndian);
  const ifdSize = count * IFD_ENTRY_SIZE;
  const ifdView = await read(fh, ifdSize, ifdOffset + 2);

  const entries = [];

  for (let entryOffset = 0; entryOffset < ifdSize; entryOffset += IFD_ENTRY_SIZE) {
    const entry = parseEntry(ifdView, entryOffset);
    if (!entry) {
      continue;
    }
    if ('value' in entry) {
      entries.push(entry);
    } else {
      entries.push(resolveEntry(entry));
    }
  }

  return Promise.all(entries);

  function parseEntry(view, offset) {
    const fieldTag = view.getUint16(offset, littleEndian);

    const name = fieldTagNames[fieldTag];
    if (!name) {
      return;
    }

    const fieldType = view.getUint16(offset + 2, littleEndian);
    const { len, getFn } = fieldTypeMap[fieldType];

    const size = view.getUint32(offset + 4, littleEndian);

    const totalLen = size * len;
    return totalLen > 4
      ? { name, totalLen, len, size, getFn, valueOffset: view.getUint32(offset + 8, littleEndian) }
      : { name, value: getFn.call(view, offset + 8, littleEndian) };
  }

  async function resolveEntry({ name, totalLen, len, size, getFn, valueOffset }) {
    const view = await read(fh, totalLen, valueOffset);

    if (size === 1) {
      return {
        name,
        value: getFn.call(view, valueOffset, littleEndian)
      };
    }

    const value = [];
    for (let offset = 0; offset < totalLen; offset += len) {
      const v = getFn.call(view, offset, littleEndian);
      value.push(v);
    }

    return { name, value };
  }
}
