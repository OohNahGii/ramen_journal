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
  'SELECT entry_id, entry_name, picture, r.restaurant_name, r.restaurant_url, ' +
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

// Missing entry_id and entry_url
const stubbedMockListEntry = {
  entry_name: 'Generic Ramen',
  picture: './ramen.jpg',
  restaurant_name: 'Generic Ramen Restaurant',
  restaurant_url: 'http://www.google.com'
};
// Missing entry_id
const stubbedMockEntry = {
  entry_name: 'Generic Ramen',
  picture: './ramen.jpg',
  restaurant_name: 'Generic Ramen Restaurant',
  restaurant_url: 'http://www.google.com',
  city: 'Mountain View',
  state: 'CA',
  lat: 37.4222801,
  lng: -122.0927588,
  entry_date: '14/03/2018',
  rating: 4.5,
  noodles: 'Thin, straight',
  noodles_rating: 5.0,
  broth: 'Shoyu',
  broth_rating: 4.5,
  toppings: 'Egg, pork belly, nori, bamboo shoots',
  toppings_rating: 4.0,
  notes: 'This part is basically like a yelp review. Still need to figure out how to break this into paragraphs.'
};

let Entries = function () {
  let dbConn;
  if (!config.entries.mock) {
    dbConn = mysql.createConnection(config.mysql);
    dbConn.connect(); // When to end connection?
  }

  function generateMockEntries(offset) {
    let entries = [];
    for (let entryId = offset; entryId < offset + numEntriesPerPage; entryId++) {
      let entry = Object.assign({}, stubbedMockListEntry);
      entry.entry_id = entryId;
      entry.entry_url = constructEntryUrl(entry);
      entries.push(entry);
    }
    return entries;
  }

  function generateMockEntry(entryId) {
    return Object.assign({entry_id: entryId}, stubbedMockEntry);
  }

  function constructEntryUrl(entry) {
    return '/' + entry.entry_id + '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-');
  }

  this.getEntries = (page, res) => {
    const offset = (page - 1) * numEntriesPerPage;
    if (!config.entries.mock) {
      dbConn.query(selectListQuery, [offset], (err, rows, fields) => {
        if (err) {
          throw err; // Need to handle gracefully...
        }
        rows.forEach((entry) => {
          entry.entry_url = constructEntryUrl(entry);
        });
        res.send(rows);
      });
    } else {
      res.send(generateMockEntries(offset));
    }
  };

  this.getEntry = (entryId, res) => {
    if (!config.entries.mock) {
      dbConn.query(selectEntryQuery, [entryId], (err, rows, fields) => {
        if (err) {
          throw err; // Need to handle gracefully...
        }
        res.send(rows.length ? rows[0] : {});
      });
    } else {
      res.send(generateMockEntry(entryId));
    }
  };
};

module.exports = new Entries();