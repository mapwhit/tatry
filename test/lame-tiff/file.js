const test = require('tape');
const { promises: { open }, constants: { O_RDONLY } } = require('fs');
const path = require('path');

const { header, ifd, parse } = require('../../lib/lame-tiff/file');

test('tiff file', function (t) {
  const file = path.resolve(__dirname, '..', 'fixtures', 'data', 'srmt-250m_13_3.tif');
  let fh;

  t.test('before', async function(t) {
    fh = await open(file, O_RDONLY);
    t.end();
  });

  t.test('should parse header', async function (t) {

    t.plan(3);
    const h = await header(fh);

    t.equal(h.fh, fh);
    t.equal(h.littleEndian, true);
    t.equal(h.ifdOffset, 8);
  });

  t.test('should parse ifd', async function (t) {

    const data = await ifd({
      fh: fh,
      littleEndian: true,
      ifdOffset: 8
    });

    t.equal(data.length, 12);
    data.forEach(d => {
      t.ok(d.name);
      t.ok(d.value);
    });
    t.end();
  });

  t.test('should parse file directory', async function (t) {

    t.plan(4);

    const result = await parse(file);

    t.ok(result.fh);
    t.ok(result.littleEndian);
    t.ok(result.fileDirectory);
    t.same(result.fileDirectory, {
      ImageWidth: 480,
      ImageLength: 192,
      BitsPerSample: 16,
      Compression: 1,
      StripOffsets: [ 578, 8258, 15938, 23618, 31298, 38978, 46658, 54338, 62018, 69698, 77378, 85058, 92738, 100418, 108098, 115778, 123458, 131138, 138818, 146498, 154178, 161858, 169538, 177218 ],
      SamplesPerPixel: 1,
      RowsPerStrip: 8,
      StripByteCounts: [ 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680 ],
      PlanarConfiguration: 1,
      SampleFormat: 2,
      ModelPixelScale: [ 0.00208333333, 0.00208333333, 0 ],
      ModelTiepoint: [ 0, 0, 0, -107.00208331573002, 40.808333172039994, 0 ],
    });
  });

  t.test('after', async function(t) {
    await fh.close();
    t.end();
  });

});
