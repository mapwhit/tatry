const { promises: { open }, constants: { O_RDONLY } } = require('fs');
const path = require('path');

const { header, ifd, parse } = require('../../lib/lame-tiff/file');

describe('tiff file', function () {
  const file = path.resolve(__dirname, '..', 'fixtures', 'data', 'srmt-250m_13_3.tif');

  before(function() {
    return open(file, O_RDONLY).then(fh => this.fh = fh);
  });

  after(function() {
    return this.fh.close();
  });

  it('should parse header', function () {

    return header(this.fh).then(header => {
      header.should.have.property('fh', this.fh);
      header.should.have.property('littleEndian', true);
      header.should.have.property('ifdOffset', 8);
    });
  });

  it('should parse ifd', function () {

    return ifd({
      fh: this.fh,
      littleEndian: true,
      ifdOffset: 8
    }).then(data => {
      data.should.have.length(12);
      data.forEach(d => {
        d.should.have.property('name');
        d.should.have.property('value');
      });
    });
  });

  it('should parse file directory', function () {

    return parse(file).then(result => {
      result.should.have.property('fh');
      result.should.have.property('littleEndian', true);
      result.should.have.property('fileDirectory');
      result.fileDirectory.should.be.eql({
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
  });

});
