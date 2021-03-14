class Optimization {
  constructor(deserializedProject) {
    this.project = deserializedProject;
  }

  warn(...args) {
    console.warn(`${this.constructor.name}: warn:`, ...args);
  }

  run() {
    throw new Error('Not implemented');
  }
}

module.exports = Optimization;
