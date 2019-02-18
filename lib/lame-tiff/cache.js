const LRU = require('lru-cache');
const bytes = require('bytes');

const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || '100mb';

const cache = new LRU({
  max: bytes(TATRY_CACHE_SIZE),
  maxAge: Number.MAX_SAFE_INTEGER,
  stale: true,
  length: item => item.byteCount
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
