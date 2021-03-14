const Optimization = require('./optimization');
const md5 = require('../md5');

class AssetOptimization extends Optimization {
  optimizeAsset(data) {
    throw new Error('Not implemented');
  }

  optimizeAssetWithSafetyChecks(data) {
    const optimized = this.optimizeAsset(data);
    if (optimized.byteLength > data.byteLength) {
      console.warn("optimization made asset larger");
      return data;
    }
    return optimized;
  }

  shouldOptimize(asset) {
    return false;
  }

  run() {
    const alreadyOptimizedAssets = new Map();
    for (const target of this.project.projectData.targets) {
      for (const asset of [...target.costumes, ...target.sounds]) {
        if (!this.shouldOptimize(asset)) {
          continue;
        }

        const md5ext = asset.md5ext;
        let newmd5ext;

        if (alreadyOptimizedAssets.has(md5ext)) {
          newmd5ext = alreadyOptimizedAssets.get(md5ext);
        } else {
          const extension = md5ext.split('.')[1];
          const assetData = this.project.assets.get(md5ext);
          const optimizedAssetData = this.optimizeAssetWithSafetyChecks(assetData);
          newmd5ext = `${md5(optimizedAssetData)}.${extension}`;
          alreadyOptimizedAssets.set(md5ext, newmd5ext);
          this.project.assets.delete(md5ext);
          this.project.assets.set(newmd5ext, optimizedAssetData);
        }

        console.log(`${md5ext} -> ${newmd5ext}`);

        asset.md5ext = newmd5ext;
        asset.assetId = newmd5ext.split('.')[0];
      }
    }
  }
}

module.exports = AssetOptimization;
