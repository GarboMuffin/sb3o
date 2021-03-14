const Optimization = require('./optimization');

class RemoveEmptyFields extends Optimization {
  run() {
    for (const target of this.project.projectData.targets) {
      for (const block of Object.values(target.blocks)) {
        if (block.opcode === 'procedures_call' || block.opcode === 'procedures_prototype') {
          block.mutation.warp = JSON.parse(block.mutation.warp);
        }
      }
    }
  }
}

module.exports = RemoveEmptyFields;
