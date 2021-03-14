const JSZip = require('jszip');
const {stringify} = require('./json');

const serialize = async (deserializedProject) => {
  const zip = new JSZip();
  zip.file('project.json', stringify(deserializedProject.projectData));
  for (const [file, data] of deserializedProject.assets.entries()) {
    zip.file(file, data);
  }
  return zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
};

module.exports = serialize;
