import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import bounds from '../lib/bounds.js';

test('nounds should extract bounds for file', async function () {
  const file = path.resolve(import.meta.dirname, 'fixtures', 'data', 'srmt-250m_13_3.tif');

  assert.deepEqual(await bounds(file), {
    minX: -107.00208331573002,
    maxX: -106.00208331733002,
    minY: 40.408333172679995,
    maxY: 40.808333172039994,
    file,
    meta: {
      littleEndian: true,
      width: 480,
      height: 192,
      tileHeight: 8,
      tileWidth: 480,
      tilesPerCol: 24,
      tilesPerRow: 1,
      byteCounts: [
        7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680, 7680,
        7680, 7680, 7680, 7680, 7680, 7680
      ],
      offsets: [
        578, 8258, 15938, 23618, 31298, 38978, 46658, 54338, 62018, 69698, 77378, 85058, 92738, 100418, 108098, 115778,
        123458, 131138, 138818, 146498, 154178, 161858, 169538, 177218
      ],
      it: [51361.000073728006, 480.00000076799995, 0, 19587.999953919996, 0, -480.00000076799995]
    }
  });
});
