const deserialize = require('./deserialize');
const serialize = require('./serialize');
const optimizations = require('./optimizations');

const optimize = async (project, options) => {
  let deserialized = await deserialize(project);

  for (const optimization of Object.values(optimizations)) {
    const optimizer = new optimization(deserialized);
    await optimizer.run();
  }

  const serialized = await serialize(deserialized);

  return serialized;
};

module.exports = optimize;
