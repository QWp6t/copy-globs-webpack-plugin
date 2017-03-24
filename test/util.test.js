/* eslint-env jest */

const util = require('../src/util');

describe('Utils', () => {
	describe('promisify()', () => {
		/** setup */
		const successMsg = 'Yay it worked!';
		const errMsg = 'First parameter must be a string';
		const nodeStyleAsyncFn = (str, callback) => {
			const err = (typeof str === 'string') ? null : errMsg;
			const data = (typeof str === 'string') ? successMsg : null;
			setTimeout(() => {
				callback(err, data);
			}, 5);
		};
		const promisifiedAsyncFn = util.promisify(nodeStyleAsyncFn);

		/** tests */
		it('should be a Promise instance', () => {
			expect(promisifiedAsyncFn('a string')).toBeInstanceOf(Promise);
		});
		it('should resolve successes', () => {
			return promisifiedAsyncFn('a string')
				.then(data => expect(data).toBe(successMsg));
		});
		it('should reject errors', () => {
			return promisifiedAsyncFn(['not', 'a', 'string'])
				.catch(err => expect(err).toBe(errMsg));
		});
	});

	describe('memoize()', () => {
		it('should cache results', () => {
			let hasRun = false;
			const add = function () {
				if (hasRun) {
					throw new Error('expensive operation is being called more than once');
				}
				hasRun = true;
				return [].reduce.call(arguments, (result, value) => result + value);
			};

			const expected = 100;
			expect(expected).toBe(util.memoize(add, 10, 20, 30, 40));
			expect(expected).toBe(util.memoize(add, 10, 20, 30, 40));
		});
		it('should not collide when bound instance methods are passed', () => {
			const test = new Map();
			const dummy = new Map();
			const expected = 'bar';
			dummy.set('foo', 'definitely not bar');
			test.set('foo', expected);

			expect(expected).not.toBe(util.memoize(Map.prototype.get.bind(dummy), 'foo')); // dummy.get('foo') // => 'definitely not bar'
			expect(expected).toBe(util.memoize(Map.prototype.get.bind(test), 'foo')); // test.get('foo') // => expected
		});
		describe('memoize.expire()', () => {
			it('should expire memoized results', () => {
				let expected = 'foo';
				const fn = () => expected;

				expect(util.memoize(fn)).toBe(expected); // => 'foo'

				expected = 'bar';
				expect(util.memoize(fn)).not.toBe(expected); // => 'foo' !== 'bar'

				util.memoize.expire(fn);
				expect(util.memoize(fn)).toBe(expected); // => 'bar'
			});
		});
		describe('memoize.clear()', () => {
			it('should clear all memoized results', () => {
				let expected = 'foo';
				let expected2 = 'bar';
				const fn = () => expected;
				const fn2 = () => expected2;

				expect(util.memoize(fn)).toBe(expected); // => 'foo'
				expect(util.memoize(fn2)).toBe(expected2); // => 'bar'

				expected = 'bar';
				expected2 = 'foo';
				expect(util.memoize(fn)).not.toBe(expected); // => 'foo' !== 'bar'
				expect(util.memoize(fn2)).not.toBe(expected2); // => 'bar' !== 'foo'

				util.memoize.clear();
				expect(util.memoize(fn)).toBe(expected); // => 'bar'
				expect(util.memoize(fn2)).toBe(expected2); // => 'foo'
			});
		});
	});

	describe('fixPath()', () => {
		it('converts backslashes (`\\`) into slashes (`/`)', () => {
			const expected = 'path/to/file.ext';
			expect(expected).toBe(util.fixPath('path\\to\\file.ext'));
		});
	});

	describe('interpolateName()', () => {
		/** TODO */
	});
});
