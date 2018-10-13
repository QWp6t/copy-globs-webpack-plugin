const { memoize } = require("./util");

module.exports = class Cache extends Map {
  constructor() {
    const self = new Map();
    self.__proto__ = Cache.prototype; // eslint-disable-line no-proto
    return self;
  }
  get(key, fn = null, ...args) {
    if (this.has(key) || !fn) {
      return Map.prototype.get.call(this, key);
    }
    this.set(key, memoize(fn, ...args));
    return Map.prototype.get.call(this, key);
  }
};
