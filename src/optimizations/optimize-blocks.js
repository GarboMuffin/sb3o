const Optimization = require('./optimization');

class OptimizeBlocks extends Optimization {
  run() {
    for (const target of this.project.projectData.targets) {
      for (const block of Object.values(target.blocks)) {
        if (block.fields) {
          if (Object.keys(block.fields).length === 0) {
            delete block.fields;
          }
        }
        if (block.inputs) {
          if (Object.keys(block.inputs).length === 0) {
            delete block.inputs;
          }
        }
        if (!block.topLevel) {
          delete block.topLevel;
        }
        if (!block.shadow) {
          delete block.shadow;
        }
      }
    }
  }
}

module.exports = OptimizeBlocks;
