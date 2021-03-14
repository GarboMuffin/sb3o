const Optimization = require('./optimization');

class RemoveRedundantMonitorValue extends Optimization {
  run() {
    for (const monitor of this.project.projectData.monitors) {
      if (Array.isArray(monitor.value)) {
        monitor.value = [];
      } else {
        monitor.value = 0;
      }
    }
  }
}

module.exports = RemoveRedundantMonitorValue;
