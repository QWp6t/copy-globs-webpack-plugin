let cache = new WeakMap();

/**
 * @param {function} fn
 * @param {...any} [...args]
 * @return {any} - Results of fn(...args)
 */
module.exports = function memoize (fn, ...args) {
  if (!cache.has(fn)) cache.set(fn, fn.apply(fn, args));
  return cache.get(fn);
};

/**
 * @param {function} fn
 * @param {...any} [...args]
 * @return {void}
 */
module.exports.expire = (fn, ...args) => {
  cache.delete(fn, fn.apply(fn, args));
};

/**
 * @return {void}
 */
module.exports.clear = () => {
  cache = new WeakMap();
};
