const LRU = require('lru-cache');

 // 500 items - each item is a promise, that can keep quite a large buffer
const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || 500;

const cache = new LRU({
  max: TATRY_CACHE_SIZE,
  maxAge: Number.MAX_SAFE_INTEGER,
  stale: true
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
