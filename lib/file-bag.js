import Debug from 'debug';
import Flatbush from 'flatbush';

const debug = Debug('tatry:file-bag');

export default fileBag;

function init(data) {
  const tree = new Flatbush(data.length);
  for (const { minX, minY, maxX, maxY } of data) {
    tree.add(minX, minY, maxX, maxY);
  }
  tree.finish();
  return tree;
}

function fileBag(data) {
  debug('Working with %d files', data.length);

  const tree = init(data);

  function find(ll) {
    const indexes = tree.search(ll[0], ll[1], ll[0], ll[1]);
    if (indexes.length === 0) {
      return;
    }
    if (indexes.length === 1) {
      return data[indexes[0]];
    }
    // pick the one with smallest pixels i.e. biggest scale in inverted transformation
    return indexes.map(i => data[i]).reduce((a, b) => (a.meta.it[1] > b.meta.it[1] ? a : b));
  }

  return {
    find
  };
}
