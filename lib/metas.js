const path = require('node:path');
const { readFile, writeFile, readdir } = require('node:fs/promises');
const debug = require('debug')('tatry:metas');

const bounds = require('./bounds');

module.exports = metas;

function write(file, data) {
  const str = JSON.stringify(data, null, 2);
  writeFile(file, str).catch(err => console.error('Could not write metas file.', err));
}

function metas(dir, writeIfMissing = false) {
  debug('create metas from <%s> directory', dir);

  const file = path.resolve(dir, 'tatry.json');
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

/**
 * Find all TIFF files in the directory and create a new metas file
 *
 * @param {string} dir name of the directory
 * @returns promise with array of metas
 */
async function fromDirectory(dir) {
  debug('create new JSON file');

  const dirents = await readdir(dir, { withFileTypes: true, recursive: true });

  const files = dirents
    .filter(dirent => dirent.isFile() && dirent.name.match(/\.tiff?$/))
    .map(dirent => path.resolve(dirent.parentPath, dirent.name));
  debug('found %d files', files.length);

  const promiseBounds = files.map(bounds);
  return Promise.all(promiseBounds);
}

async function fromJSON(file) {
  debug('check for existing JSON file: %s', file);

  const str = await readFile(file, 'utf8');
  return JSON.parse(str);
}
