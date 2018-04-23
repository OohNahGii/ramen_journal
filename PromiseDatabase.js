const mysql = require('mysql');

class PromiseDatabase {
  constructor() {
    this.db = null;
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      try {
        this.db = mysql.createConnection(config);
        this.db.connect();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  isConnected() {
    // Actually check connection by checking the 'state' variable?
    return !!this.db;
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      if (args) {
        this.db.query(sql, args, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      } else {
        this.db.query(sql, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      }
    });
  }
}