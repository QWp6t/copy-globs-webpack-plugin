const { memoize } = require('./util');

module.exports = class Cache extends Map {
  get (key, fn = null, ...args) {
    if (this.has(key) || !fn) {
      return Map.prototype.get.call(this, key);
    }
    this.set(key, memoize(fn, ...args));
    return Map.prototype.get.call(this, key);
  }
};
