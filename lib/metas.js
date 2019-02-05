const find = require('find');
const path = require('path');
const { readFile, writeFile } = require('fs');
const debug = require('debug')('tatry:metas');

const bounds = require('./bounds');

module.exports = metas;


function write(file, data) {
  let str = JSON.stringify(data, null, 2);
  writeFile(file, str, err => {
    if (err) {
      console.error('Could not write metas file.', err);
    }
  });
}

function metas(dir, writeIfMissing = false) {
  debug('create metas from <%s> directory', dir);

  let file = path.resolve(dir, 'tatry.json');
  let missing = false;

  return fromJSON(file)
    .catch(() => {
      missing = true;
      return fromDirectory(dir);
    })
    .then(data => {
      if (missing && writeIfMissing) {
        write(file, data);
      }
      return data;
    });
}

function fromDirectory(dir) {

  debug('create new JSON file');

  return new Promise(executor);

  function executor(resolve) {
    find.file(/\.tiff?$/, dir, files => {

      debug('found %d files', files.length);

      const promiseBounds = files.map(bounds);
      resolve(Promise.all(promiseBounds));
    });
  }
}

function fromJSON(file) {

  debug('check for existing JSON file: %s', file);

  return new Promise(executor);

  function executor(resolve, reject) {
    readFile(file, 'utf8', (err, str) => {
      if (err) {
        return reject(err);
      }
      try {
        resolve(JSON.parse(str));
      } catch(e) {
        reject(e);
      }
    });
  }
}
