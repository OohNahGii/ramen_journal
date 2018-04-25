const redis = require('redis');

class PromiseCache {
  constructor() {
    this.cache = null;
  }
  
  connect(config) {
    return new Promise((resolve, reject) => {
      this.cache = redis.createClient({
        retry_strategy: function (options) {
          // Todo: more robust retry strategy (multiple attempts, time between retry)
          const error = new Error('Error connecting to cache');
          reject(error);
          return error;
        }
      });
      this.cache.on('connect', function (event) {
        resolve();
      });
    });
  }

  isConnected() {
    return this.cache && this.cache.connected;
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