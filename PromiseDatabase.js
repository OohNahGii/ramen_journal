const mysql = require('mysql');

class PromiseDatabase {
  constructor() {
    this.db = null;
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      this.db = mysql.createConnection(config);
      this.db.connect(function (error) {
        if (error) {
          reject(new Error('Error connection to database'));
        } else {
          resolve();
        }
      });
      this.db.on('error', error => {
        console.log(error);
        // Todo: handle connection loss differently than other errors?
        this.db = null;
      });
    });
  }

  isConnected() {
    return this.db && this.db.state !== 'disconnected';
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

module.exports = new PromiseDatabase();