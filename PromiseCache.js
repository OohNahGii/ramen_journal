const redis = require('redis');

class PromiseCache {
  constructor() {
    this.cache = null;
  }
  
  connect(config) {
    return new Promise((resolve, reject) => {
      try {
        this.cache = redis.createClient();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  isConnected() {
    // Actually check connection by running a simple query?
    return !!this.cache;
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.cache.get(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  set(key, item) {
    return new Promise((resolve, reject) => {
      this.cache.set(key, item, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

module.exports = new PromiseCache();