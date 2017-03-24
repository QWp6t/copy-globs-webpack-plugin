/**
 * Node-style asynchronous function.
 *
 * @callback nodeAsyncCallback
 * @param {string|null} err
 * @param {*} data
 */
/**
 * Promisify node-style asynchronous functions
 *
 * @param  {nodeAsyncCallback} callback - Function with node-style callback
 * @param  {this} [thisArg] - Value to use as `this` when executing `callback`.
 * @return {Promise} - An instance of Promise
 */
module.exports = (callback, thisArg) => function () {
	const args = [].slice.call(arguments);
	return new Promise((resolve, reject) => {
		args.push((err, data) => (err === null ? resolve(data) : reject(err)));
		return callback.apply(thisArg, args);
	});
};
