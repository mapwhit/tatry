const rbush = require('rbush');

module.exports = fileBag;

function init(data) {
  const tree = rbush();
  data.forEach(({ coords,  file }) => {
    const [ minY, maxY, minX, maxX ] = coords;
    const item = {
      minX,
      maxX,
      minY,
      maxY,
      file
    };
    tree.insert(item);
  });
  return tree;
}


function fileBag(data) {

  const tree = init(data);

  function find(ll) {
    const files = tree.search({
      minX: ll[0],
      minY: ll[1],
      maxX: ll[0],
      maxY: ll[1]
    });
    const { file } = files[0] || {};
    return file;
  }

  return {
    find
  };
}
