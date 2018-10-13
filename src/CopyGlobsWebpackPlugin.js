const glob = require("glob");
const chokidar = require("chokidar");

const WebpackFile = require("./WebpackFile");
const { promisify } = require("./util");

const errorMsg = msg => `\u001B[31m${msg}\u001B[0m`;

const GLOB_CWD_AUTO = null;

const globAsync = promisify(glob);

class PatternUndefinedError extends Error {
  constructor() {
    super(errorMsg("[copy-globs] You must provide glob pattern."));
    this.name = "PatternUndefinedError";
  }
}

class ArgsArrayError extends TypeError {
  constructor() {
    super(
      errorMsg(
        "[copy-globs] pattern cannot be an array.\n" +
          "For multiple folders, use something like:\n\n" +
          "  +(images|fonts)/**/*\n\n" +
          "See also: https://github.com/isaacs/node-glob#glob-primer\n"
      )
    );
    this.name = "ArgsArrayError";
  }
}

/**
 * Throws an error if pattern is an array or undefined
 *
 * @param pattern
 */
const validatePattern = pattern => {
  if (pattern === undefined) {
    throw new PatternUndefinedError();
  }
  if (Array.isArray(pattern)) {
    throw new ArgsArrayError();
  }
};

const normalizeArguments = input => {
  validatePattern(input);
  const options = {};
  if (typeof input === "string") {
    options.pattern = input;
  } else {
    validatePattern(input.pattern);
    return input;
  }
  return options;
};

module.exports = class {
  constructor(o) {
    const options = normalizeArguments(o);
    this.pattern = options.pattern;
    this.disable = options.disable;
    this.output = options.output || "[path][name].[ext]";
    this.globOptions = Object.assign(options.globOptions || {}, {
      cwd: GLOB_CWD_AUTO
    });
    this.globOptions.nodir = true;
    this.manifest = options.manifest || {};
    this.files = [];
    this.watcher = null;
  }
  apply(compiler) {
    if (this.disable) {
      return;
    }
    this.compiler = compiler;
    this.resolveWorkingDirectory();
    if (!this.compiler.hooks) {
      this.deprecated();
      return;
    }
    this.compiler.hooks.emit.tapAsync(
      { name: "CopyGlobsPlugin" },
      this.emitHandler.bind(this)
    );
    this.compiler.hooks.afterEmit.tapAsync(
      { name: "CopyGlobsPlugin" },
      this.afterEmitHandler.bind(this)
    );
    this.compiler.hooks.watchRun.tapAsync(
      { name: "CopyGlobsPlugin" },
      this.watcherHandler.bind(this)
    );
  }
  deprecated() {
    this.compiler.plugin("emit", this.emitHandler.bind(this));
    this.compiler.plugin("after-emit", this.afterEmitHandler.bind(this));
    this.compiler.plugin("watch-run", this.watcherHandler.bind(this));
  }
  watcherHandler(compilation, callback) {
    if (!this.watcher) {
      this.startWatcher();
    }
    callback();
  }
  startWatcher() {
    this.watcher = chokidar
      .watch(this.pattern, { ignoreInitial: true, cwd: this.globOptions.cwd })
      .on("add", () => this.compiler.run(() => {}))
      .on("change", () => this.compiler.run(() => {}))
      .on("unlink", () => this.compiler.run(() => {}));
  }
  emitHandler(compilation, callback) {
    this.compilation = compilation;
    globAsync(this.pattern, this.globOptions)
      .then(
        paths => Promise.all(paths.map(this.processAsset.bind(this))),
        err => compilation.errors.push(err)
      )
      .then(() => {
        Object.keys(this.files).forEach(absoluteFrom => {
          const file = this.files[absoluteFrom];
          this.manifest[file.relativeFrom] = file.webpackTo;
          this.compilation.assets[file.webpackTo] = {
            size: () => file.stat.size,
            source: () => file.content
          };
        });
      })
      .then(callback); // eslint-disable-line promise/no-callback-in-promise
  }
  afterEmitHandler(compilation, callback) {
    Object.keys(this.files)
      .filter(absoluteFrom => !compilation.fileDependencies.has(absoluteFrom))
      .forEach(absoluteFrom => compilation.fileDependencies.add(absoluteFrom));
    callback();
  }
  resolveWorkingDirectory() {
    if (this.globOptions.cwd === GLOB_CWD_AUTO) {
      this.globOptions.cwd = this.compiler.options.context;
    }
    this.context = this.globOptions.cwd || this.compiler.options.context;
  }
  processAsset(relativeFrom) {
    if (this.compilation.assets[relativeFrom]) {
      return Promise.resolve();
    }
    return this.addAsset(
      new WebpackFile(relativeFrom, this.output, this.context)
    );
  }
  addAsset(file) {
    const asset = this.getAsset(file.absoluteFrom);
    if (asset && asset.hash === file.hash) {
      return null;
    }
    this.files[file.absoluteFrom] = file;
    return file;
  }
  getAsset(absoluteFrom) {
    return this.files[absoluteFrom];
  }
};
