const mysql = require('mysql');
const config = require('./config.json');

const numEntriesPerPage = 25;
const selectListQuery = 
  'SELECT entry_id, entry_name, picture, r.restaurant_name, r.website FROM entry ' + 
  'LEFT JOIN restaurant r ON (entry.restaurant_id = r.restaurant_id) ' + 
  'ORDER BY entry_date ' + 
  'LIMIT 25 ' + 
  'OFFSET ?';
const selectEntryQuery =
  'SELECT entry_id, entry_name, picture, r.restaurant_name, r.website, ' +
  'r.locality AS city, r.administrative_area AS state, x(r.lat_lng) AS lat, y(r.lat_lng) AS lng, ' +
  'entry_date, entry.rating AS rating, n.description AS noodles, n.rating AS noodles_rating, ' +
  'b.description AS broth, b.rating AS broth_rating, ' +
  't.description AS toppings, t.rating AS toppings_rating, notes ' +
  'FROM entry ' +
  'LEFT JOIN restaurant r ON (entry.restaurant_id = r.restaurant_id) ' +
  'LEFT JOIN noodles n ON (entry.noodles_id = n.noodles_id) ' +
  'LEFT JOIN broth b ON (entry.broth_id = b.broth_id) ' +
  'LEFT JOIN toppings t ON (entry.toppings_id = t.toppings_id) ' +
  'WHERE entry_id = ?';

let Entries = function () {
  const dbConn = mysql.createConnection(config.mysql);
  dbConn.connect(); // When to end connection?

  function constructEntryHref(entry) {
    return '/' + entry.entry_id + '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-');
  }

  this.getEntries = (page, res) => {
    const offset = (page - 1) * numEntriesPerPage;
    dbConn.query(selectListQuery, [offset], (err, rows, fields) => {
      if (err) {
        throw err; // Need to handle gracefully...
      }

      // Add URL to each row
      rows.forEach((entry) => {
        entry.href = constructEntryHref(entry);
      });
      res.send(rows);
    });
  };

  this.getEntry = (entryId, res) => {
    dbConn.query(selectEntryQuery, [entryId], (err, rows, fields) => {
      if (err) {
        throw err; // Need to handle gracefully...
      }
      res.send(rows.length ? rows[0] : {});
    });
  };
};

module.exports = new Entries();