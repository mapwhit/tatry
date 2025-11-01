import assert from 'node:assert/strict';
import { constants, open } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { header, ifd, parse } from '../../lib/lame-tiff/file.js';

test('tiff file', async t => {
  const file = path.resolve(import.meta.dirname, '..', 'fixtures', 'data', 'srmt-250m_13_3.tif');
  const fh = await open(file, constants.O_RDONLY);

  await t.test('should parse header', async () => {
    const h = await header(fh);

    assert.equal(h.fh, fh);
    assert.equal(h.littleEndian, true);
    assert.equal(h.ifdOffset, 8);
  });

  await t.test('should parse ifd', async () => {
    const data = await ifd({
      fh,
      littleEndian: true,
      ifdOffset: 8
    });

    assert.equal(data.length, 12);
    data.forEach(d => {
      assert(d.name);
      assert(d.value);
    });
  });

  await t.test('should parse file directory', async () => {
    const result = await parse(file);

    assert(result.fh);
    assert(result.littleEndian);
    assert(result.fileDirectory);
    assert.deepEqual(result.fileDirectory, {
      ImageWidth: 480,
      ImageLength: 192,
      BitsPerSample: 16,
      Compression: 1,
      StripOffsets: [
        578, 8258, 15938, 23618, 31298, 38978, 46658, 54338, 62018, 69698, 77378, 85058, 92738, 100418, 108098, 115778,
        123458, 131138, 138818, 146498, 154178, 161858, 169538, 177218
      ],
      SamplesPerPixel: 1,
      RowsPerStrip: 8,
      StripByteCounts: [
        7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680,
        7680, 7680, 7680, 7680, 7680, 7680
      ],
      PlanarConfiguration: 1,
      SampleFormat: 2,
      ModelPixelScale: [0.00208333333, 0.00208333333, 0],
      ModelTiepoint: [0, 0, 0, -107.00208331573002, 40.808333172039994, 0]
    });

    await result.fh.close();
  });

  await fh.close();
});
