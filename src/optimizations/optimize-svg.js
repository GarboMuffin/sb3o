const svgo = require('svgo');
const AssetOptimization = require('./asset-optimizer');

const decoder = new TextDecoder();
const encoder = new TextEncoder();

class SVGOptimizer extends AssetOptimization {
  shouldOptimize(asset) {
    return asset.dataFormat === 'svg';
  }

  optimizeAsset(data) {
    const decoded = decoder.decode(data);
    const optimized = svgo.optimize(decoded);
    return encoder.encode(optimized.data);
  }
}

module.exports = SVGOptimizer;
