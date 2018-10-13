/* eslint-env jest */

const Cache = require("../src/Cache");

describe("Cache", () => {
  const test = new Cache();
  beforeEach(test.clear.bind(test));

  describe("get()", () => {
    it("should pass additional arguments to memoize()", () => {
      const add = function() {
        return [].reduce.call(arguments, (result, value) => result + value);
      };
      const expected = 100;
      expect(expected).toBe(test.get("result", add, 10, 20, 30, 40));
      expect(expected).toBe(test.get("result"));
    });
  });
});
