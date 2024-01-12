const { LRUCache } = require('lru-cache');
const bytes = require('bytes');

const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || '100mb';

const cache = new LRUCache({
  maxSize: bytes(TATRY_CACHE_SIZE),
  sizeCalculation: item => item.byteCount
});

function key(file, index) {
  return `${file}:${index}`;
}

function put(file, index, buffer) {
  return cache.set(key(file, index), buffer);
}

function get(file, index) {
  return cache.get(key(file, index));
}

module.exports = {
  put,
  get
};
