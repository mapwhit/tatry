const LRU = require('lru-cache');

 // ~ 200MB
const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || 100 * 1024 * 1024;

const cache = new LRU({
  max: TATRY_CACHE_SIZE,
  length: (n, key) => n.length + key.length,
  maxAge: 1000 * 60 * 60 * 24 // 24 hours
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
