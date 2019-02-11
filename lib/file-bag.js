const rbush = require('rbush');
const debug = require('debug')('tatry:file-bag');

module.exports = fileBag;

function init(data) {
  const tree = rbush();
  tree.load(data);
  return tree;
}

function fileBag(data) {
  debug('Working with %d files', data.length);

  const tree = init(data);

  function find(ll) {
    const files = tree.search({
      minX: ll[0],
      minY: ll[1],
      maxX: ll[0],
      maxY: ll[1]
    });
    if (files.length === 0) {
      return;
    } else if (files.length === 1) {
      return files[0];
    } else {
      // pick the one with smallest pixels i.e. biggest scale in inverted transformation
      return files.reduce((a, b) => a.meta.it[1] > b.meta.it[1] ? a : b);
    }
  }

  return {
    find
  };
}
