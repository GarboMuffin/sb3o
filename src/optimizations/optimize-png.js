const AssetOptimization = require('./asset-optimizer');
const imageminOptiPng = require('imagemin-optipng');
const os = require('os');

class PNGOptimizer extends AssetOptimization {
  shouldOptimize(asset) {
    return asset.dataFormat === 'png';
  }

  getConcurrency() {
    return Math.max(1, os.cpus().length - 1);
  }

  async optimizeAsset(data) {
    const result = await imageminOptiPng()(Buffer.from(data));
    return result;
  }
}

module.exports = PNGOptimizer;
