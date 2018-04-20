const mysql = require('mysql');
const redis = require('redis');
const config = require('./config.json');

const notesSeparator = ';;';
const imageTypes = {
  list: 'list',
  detail: 'detail'
};

const selectListQuery = 
  'SELECT entry.entry_id, entry_name, i.image_name AS image, r.restaurant_name, r.restaurant_url FROM entry ' +
  'LEFT JOIN restaurant r ON (entry.restaurant_id = r.restaurant_id) ' +
  'RIGHT JOIN image i ON (entry.entry_id = i.entry_id) ' +
  'WHERE i.image_type = "' + imageTypes.list + '" ' +
  'ORDER BY entry_date DESC';

const selectEntryQuery =
  'SELECT entry.entry_id, entry_name, i.image_name AS image, r.restaurant_name, r.restaurant_url, ' +
  'r.city, r.state, x(r.lat_lng) AS lat, y(r.lat_lng) AS lng, ' +
  'DATE_FORMAT(entry_date, "%b %D, %Y") as entry_date, entry.rating AS rating, n.description AS noodles, n.rating AS noodles_rating, ' +
  'b.description AS broth, b.rating AS broth_rating, ' +
  't.description AS toppings, t.rating AS toppings_rating, notes ' +
  'FROM entry ' +
  'LEFT JOIN restaurant r ON (entry.restaurant_id = r.restaurant_id) ' +
  'LEFT JOIN noodles n ON (entry.noodles_id = n.noodles_id) ' +
  'LEFT JOIN broth b ON (entry.broth_id = b.broth_id) ' +
  'LEFT JOIN toppings t ON (entry.toppings_id = t.toppings_id) ' +
  'RIGHT JOIN image i ON (entry.entry_id = i.entry_id) ' +
  'WHERE entry.entry_id = ? ' +
  'AND i.image_type = "' + imageTypes.detail + '"';

const listCacheKey = 'entries';
const entryCacheKey = 'entry-';


let Entries = function () {
  // Setup db connection
  const db = mysql.createConnection(config.mysql); // Note: user defined in the config should be read-only
  db.connect(); // When to end connection?

  // Setup cache connection
  const cache = redis.createClient();

  function constructEntryUrl(entry) {
    return '/' + entry.entry_id /*+ '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-')*/;
  }

  function parseNotes(notes) {
    return notes.split(notesSeparator);
  }

  function constructEntryCacheKey(entryId) {
    return entryCacheKey + entryId;
  }

  this.getEntries = (res) => {
    cache.get(listCacheKey, function (err, reply) {
      if (reply) {
        console.log('Retrieving entries from cache');
        res.send(JSON.parse(reply));
      } else {
        console.log('Retrieving entries from db');
        db.query(selectListQuery, (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.send([]);
          } else {
            rows.forEach((entry) => {
              entry.entry_url = constructEntryUrl(entry);
            });
            cache.set(listCacheKey, JSON.stringify(rows));
            res.send(rows);
          }
        });
      }
    });
  };

  this.getEntry = (entryId, res) => {
    const cacheKey = constructEntryCacheKey(entryId);
    cache.get(cacheKey, function (err, reply) {
      if (reply) {
        console.log('Retrieving entry "' + entryId + '" from cache');
        res.send(JSON.parse(reply));
      } else {
        console.log('Retrieving entry "' + entryId + '" from db');
        db.query(selectEntryQuery, [entryId], (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.send({});
          } else {
            if (rows.length) {
              const tempEntry = rows[0];
              let entry = Object.assign({}, tempEntry);
              entry.notes = parseNotes(tempEntry.notes);
              cache.set(cacheKey, JSON.stringify(entry));
              res.send(entry);
            } else {
              res.send({});
            }
          }
        });
      }
    });
  };
};

module.exports = new Entries();