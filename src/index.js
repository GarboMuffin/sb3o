const deserialize = require('./deserialize');
const serialize = require('./serialize');
const optimizations = require('./optimizations');

const optimize = async (project, options) => {
  let deserialized = await deserialize(project);

  for (const optimizationId of Object.keys(optimizations)) {
    console.log(`${optimizationId}...`);
    const optimization = optimizations[optimizationId];
    const optimizer = new optimization(deserialized);
    await optimizer.run();
  }

  const serialized = await serialize(deserialized);

  return serialized;
};

module.exports = optimize;
