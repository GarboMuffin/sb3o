const svgo = require('svgo');
const AssetOptimization = require('./asset-optimizer');

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const plugins = [
  // Enabled by default
  'removeDoctype',
  'removeXMLProcInst',
  'removeComments',
  'removeMetadata',
  'removeEditorsNSData',
  'cleanupAttrs',
  'inlineStyles',
  'minifyStyles',
  'cleanupIDs',
  'removeUselessDefs',
  'cleanupNumericValues',
  'convertColors',
  'removeUnknownsAndDefaults',
  'removeNonInheritableGroupAttrs',
  'removeUselessStrokeAndFill',
  // do not remove viewbox
  // 'removeViewBox',
  'cleanupEnableBackground',
  'removeHiddenElems',
  'removeEmptyText',
  'convertShapeToPath',
  'convertEllipseToCircle',
  'moveElemsAttrsToGroup',
  'moveGroupAttrsToElems',
  'collapseGroups',
  'convertPathData',
  'convertTransform',
  'removeEmptyAttrs',
  'removeEmptyContainers',
  'mergePaths',
  'removeUnusedNS',
  'sortDefsChildren',
  'removeTitle',
  'removeDesc'
];

class SVGOptimizer extends AssetOptimization {
  shouldOptimize(asset) {
    return asset.dataFormat === 'svg';
  }

  getConcurrency() {
    return 5;
  }

  optimizeAsset(data) {
    const decoded = decoder.decode(data);
    const optimized = svgo.optimize(decoded, {
      plugins
    });
    return encoder.encode(optimized.data);
  }
}

module.exports = SVGOptimizer;
