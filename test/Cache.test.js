/* eslint-env mocha */

const Cache = require('../src/Cache');
const { assert } = require('chai');

describe('Cache', () => {
  const test = new Cache();
  before('setup', test.clear.bind(test));

  describe('get()', () => {
    it('should pass additional arguments to memoize()', () => {
      const add = function () { return [].reduce.call(arguments, (result, value) => result + value); };
      const expected = 100;
      assert.equal(expected, test.get('result', add, 10, 20, 30, 40));
      assert.equal(expected, test.get('result'));
    });
  });
});
