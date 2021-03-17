const Optimization = require('./optimization');
const md5 = require('../md5');

class AsyncLimiter {
  constructor ({concurrency}) {
    this.concurrency = concurrency;
    this.jobs = [];
    this.error = false;
  }

  add(callback) {
    this.jobs.push(callback);
  }

  _jobFinish() {
    if (this.jobs.length) {
      this._startJob();
    } else {
      this._resolve();
    }
  }

  _jobError(e) {
    this.error = true;
    this._reject(e);
  }

  _startJob() {
    if (this.error) {
      return;
    }
    const job = this.jobs.shift();
    job()
      .then(() => this._jobFinish())
      .catch((e) => this._jobError(e));
  }

  done() {
    if (this.jobs.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      for (let i = 0; i < Math.min(this.concurrency, this.jobs.length); i++) {
        this._startJob();
      }
    });
  }
}

class AssetOptimization extends Optimization {
  shouldOptimize(asset) {
    return false;
  }

  getConcurrency() {
    return 5;
  }

  async optimizeAsset(data) {
    throw new Error('Not implemented');
  }

  run() {
    const assetsToOptimize = new Map();
    for (const target of this.project.projectData.targets) {
      for (const asset of [...target.costumes, ...target.sounds]) {
        if (this.shouldOptimize(asset)) {
          const md5ext = asset.md5ext;
          if (assetsToOptimize.has(md5ext)) {
            assetsToOptimize.get(md5ext).push(asset);
          } else {
            assetsToOptimize.set(md5ext, [asset]);
          }
        }
      }
    }

    const limiter = new AsyncLimiter({
      concurrency: this.getConcurrency()
    });
    for (const [md5ext, assets] of assetsToOptimize.entries()) {
      limiter.add(async () => {
        const extension = md5ext.split('.')[1];
        const assetData = this.project.assets.get(md5ext);
        if (!assetData) {
          this.warn(`${md5ext} does not exist; skipping`);
          return;
        }
        const optimizedAssetData = await this.optimizeAsset(assetData);
        if (optimizedAssetData.byteLength > assetData.byteLength) {
          this.warn(`optimizing ${md5ext} increased size; skipping`);
          return;
        }

        const newmd5ext = `${md5(optimizedAssetData)}.${extension}`;
        this.project.assets.delete(md5ext);
        this.project.assets.set(newmd5ext, optimizedAssetData);

        for (const asset of assets) {
          asset.md5ext = newmd5ext;
          asset.assetId = newmd5ext.split('.')[0];
        }
      });
    }

    return limiter.done();
  }
}

module.exports = AssetOptimization;
