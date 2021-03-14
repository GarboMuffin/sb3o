const Optimization = require('./optimization');

class RemoveEmptyFields extends Optimization {
  run() {
    for (const target of this.project.projectData.targets) {
      for (const block of Object.values(target.blocks)) {
        if (Object.keys(block.fields).length === 0) {
          delete block.fields;
        }
        if (Object.keys(block.inputs).length === 0) {
          delete block.inputs;
        }
      }
    }
  }
}

module.exports = RemoveEmptyFields;
