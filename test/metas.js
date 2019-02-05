const path = require('path');
const should = require('should');

const metas = require('../lib/metas');

describe('metas', function () {
  it('should extract metas from directory', function () {

    const dir = path.resolve(__dirname, 'fixtures', 'data');

    return metas(dir)
      .then(data => {
        should.exist(data);
        data.should.have.length(2);
      });
  });
});
