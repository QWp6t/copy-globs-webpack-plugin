/* eslint-env mocha */

const util = require('../src/util');
const { assert } = require('chai');

describe('Utils', () => {
  describe('promisify()', () => {
    /** setup */
    const successMsg = 'Yay it worked!';
    const errMsg = 'First parameter must be a string';
    const nodeStyleAsyncFn = (str, callback) => {
      const err = (typeof str === 'string') ? null : errMsg;
      const data = (typeof str === 'string') ? successMsg : null;
      setTimeout(() => { callback(err, data); }, 5);
    };
    const promisifiedAsyncFn = util.promisify(nodeStyleAsyncFn);

    /** tests */
    it('should be a Promise instance', () => {
      assert.instanceOf(promisifiedAsyncFn('a string'), Promise);
    });
    it('should resolve successes', () => {
      return promisifiedAsyncFn('a string')
        .then(data => assert.equal(data, successMsg));
    });
    it('should reject errors', () => {
      return promisifiedAsyncFn(['not', 'a', 'string'])
        .catch(err => assert.equal(err, errMsg));
    });
  });

  describe('memoize()', () => {
    it('should cache results', () => {
      let hasRun = false;
      const add = function () {
        if (hasRun) throw Error('expensive operation is being called more than once'); hasRun = true;
        return [].reduce.call(arguments, (result, value) => result + value);
      };

      const expected = 100;
      assert.equal(expected, util.memoize(add, 10, 20, 30, 40));
      assert.equal(expected, util.memoize(add, 10, 20, 30, 40));
    });
    it('should not collide when bound instance methods are passed', () => {
      const test = new Map();
      const dummy = new Map();
      const expected = 'bar';
      dummy.set('foo', 'definitely not bar');
      test.set('foo', expected);

      assert.notEqual(expected, util.memoize(Map.prototype.get.bind(dummy), 'foo')); // dummy.get('foo') // => 'definitely not bar'
      assert.equal(expected, util.memoize(Map.prototype.get.bind(test), 'foo')); // test.get('foo') // => expected
    });
    describe('memoize.expire()', () => {
      it('should expire memoized results', () => {
        let expected = 'foo';
        const fn = () => expected;

        assert.equal(util.memoize(fn), expected); // => 'foo'

        expected = 'bar';
        assert.notEqual(util.memoize(fn), expected); // => 'foo' !== 'bar'

        util.memoize.expire(fn);
        assert.equal(util.memoize(fn), expected); // => 'bar'
      });
    });
    describe('memoize.clear()', () => {
      it('should clear all memoized results', () => {
        let expected = 'foo';
        let expected2 = 'bar';
        const fn = () => expected;
        const fn2 = () => expected2;

        assert.equal(util.memoize(fn), expected); // => 'foo'
        assert.equal(util.memoize(fn2), expected2); // => 'bar'

        expected = 'bar';
        expected2 = 'foo';
        assert.notEqual(util.memoize(fn), expected); // => 'foo' !== 'bar'
        assert.notEqual(util.memoize(fn2), expected2); // => 'bar' !== 'foo'

        util.memoize.clear();
        assert.equal(util.memoize(fn), expected); // => 'bar'
        assert.equal(util.memoize(fn2), expected2); // => 'foo'
      });
    });
  });

  describe('fixPath()', () => {
    it('converts backslashes (`\\`) into slashes (`/`)', () => {
      const expected = 'path/to/file.ext';
      assert.equal(expected, util.fixPath('path\\to\\file.ext'));
    });
  });

  describe('interpolateName()', () => {
    /** TODO */
  });
});
