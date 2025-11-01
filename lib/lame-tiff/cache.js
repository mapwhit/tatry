import bytes from 'bytes';
import { LRUCache } from 'lru-cache';

const TATRY_CACHE_SIZE = process.env.TATRY_CACHE_SIZE || '100mb';

const cache = new LRUCache({
  maxSize: bytes(TATRY_CACHE_SIZE),
  sizeCalculation: item => item.byteCount
});

function key(file, index) {
  return `${file}:${index}`;
}

export function put(file, index, buffer) {
  return cache.set(key(file, index), buffer);
}

export function get(file, index) {
  return cache.get(key(file, index));
}
