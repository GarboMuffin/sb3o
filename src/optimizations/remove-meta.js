const Optimization = require('./optimization');

class RemoveMeta extends Optimization {
  run() {
    this.project.projectData.meta = {
      semver: '3.0.0',
      vm: '0.2.0',
      agent: ''
    };
  }
}

module.exports = RemoveMeta;
