const Optimization = require('./optimization');

class RemoveEmptyFields extends Optimization {
  run() {
    for (const target of this.project.projectData.targets) {
      for (const block of Object.values(target.blocks)) {
        if (block.opcode === 'procedures_call' || block.opcode === 'procedures_prototype') {
          if (block.mutation.warp) {
            block.mutation.warp = JSON.parse(block.mutation.warp);
          }
        } else if (block.opcode === 'control_stop') {
          if (block.mutation.hasnext) {
            block.mutation.hasnext = JSON.parse(block.mutation.hasnext);
          }
        }
      }
    }
  }
}

module.exports = RemoveEmptyFields;
