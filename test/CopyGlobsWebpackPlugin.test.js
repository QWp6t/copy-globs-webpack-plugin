/* eslint-env jest */

const { promisify } = require('../src/util'); // eslint-disable-line no-unused-vars
const CopyGlobsWebpackPlugin = require('../src/CopyGlobsWebpackPlugin'); // eslint-disable-line no-unused-vars

const noop = jest.fn(); // eslint-disable-line no-unused-vars
const nodeCallback = function () { // eslint-disable-line no-unused-vars
	const args = Array.from(arguments);
	const fn = args[args.length - 1];
	fn.apply(fn);
};

describe('CopyGlobsWebpackPlugin', () => {
	test.skip('TODO', () => {});
});
