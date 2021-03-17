const JSZip = require('jszip');
const {parse} = require('./json');

const deserialize = async (binaryProject) => {
  const zip = await JSZip.loadAsync(binaryProject);
  const projectJSONFile = zip.file(/project\.json/)[0];
  if (!projectJSONFile) {
    throw new Error('project.json does not exist');
  }
  const pathPrefix = projectJSONFile.name.substr(0, projectJSONFile.name.indexOf('project.json'));
  const projectDataText = await projectJSONFile.async('text');
  const projectData = parse(projectDataText);
  const assets = new Map();
  for (const file of Object.keys(zip.files)) {
    if (
      /^[a-z0-9]{32}\.svg$/.test(file) ||
      /^[a-z0-9]{32}\.png$/.test(file) ||
      /^[a-z0-9]{32}\.wav$/.test(file) ||
      /^[a-z0-9]{32}\.mp3$/.test(file)
    ) {
      assets.set(file, await zip.file(pathPrefix + file).async('arraybuffer'));
    }
  }
  return {
    projectData,
    assets
  };
};

module.exports = deserialize;
