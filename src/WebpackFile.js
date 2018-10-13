const fs = require("fs");
const path = require("path");
const utils = require("loader-utils");
const Cache = require("./Cache");
const { fixPath, interpolateName } = require("./util");

const destructive = ["relativeFrom", "output", "context"];
const memoized = ["absoluteFrom", "stat", "content", "webpackTo", "hash"];
const enumerable = destructive.concat(memoized);

const data = new WeakMap();

class WebpackFile {
  constructor(
    relativeFrom,
    output = "[path][name].[ext]",
    context = process.cwd()
  ) {
    this.data = new Cache();
    this.relativeFrom = relativeFrom;
    this.context = context;
    this.output = output;
  }
  get data() {
    return data.get(this);
  }
  set data(cache) {
    if (cache instanceof Cache) {
      data.set(this, cache);
    }
  }
  reset() {
    this.data.forEach(prop => {
      if (!this.destructive.includes(prop)) {
        this.data.delete(prop);
      }
    });
  }
}

Object.defineProperty(WebpackFile.prototype, "dataMap", {
  enumerable: false,
  get() {
    return {
      absoluteFrom() {
        return path.resolve(this.context, this.relativeFrom);
      },
      stat() {
        return fs.statSync(this.absoluteFrom);
      },
      content() {
        return fs.readFileSync(this.absoluteFrom);
      },
      webpackTo() {
        return fixPath(
          interpolateName(this.output, this.relativeFrom, this.content)
        );
      },
      hash() {
        return utils.getHashDigest(this.content);
      }
    };
  }
});

/** Returns properties set by the constructor */
Object.defineProperty(WebpackFile.prototype, "destructive", {
  enumerable: false,
  value: destructive,
  writable: true
});

/** Ensure all relevant properties are enumerable. */
enumerable.forEach(property =>
  Object.defineProperty(WebpackFile.prototype, property, {
    enumerable: true,
    set(value) {
      this.data.set(property, value);
      if (this.destructive.includes(property)) {
        this.reset();
      }
    },
    get() {
      if (this.dataMap[property] === undefined) {
        return this.data.get(property);
      }
      return this.data.get(property, this.dataMap[property].bind(this));
    }
  })
);

module.exports = WebpackFile;
