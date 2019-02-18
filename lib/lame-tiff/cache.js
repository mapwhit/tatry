const LRU = require('lru-cache');

// approx. 100 MB of cache
const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || 100 * 1024 * 1024;

const cache = new LRU({
  max: TATRY_CACHE_SIZE,
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
