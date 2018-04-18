const mysql = require('mysql');
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
  'entry_date, entry.rating AS rating, n.description AS noodles, n.rating AS noodles_rating, ' +
  'b.description AS broth, b.rating AS broth_rating, ' +
  't.description AS toppings, t.rating AS toppings_rating, notes ' +
  'FROM entry ' +
  'LEFT JOIN restaurant r ON (entry.restaurant_id = r.restaurant_id) ' +
  'LEFT JOIN noodles n ON (entry.noodles_id = n.noodles_id) ' +
  'LEFT JOIN broth b ON (entry.broth_id = b.broth_id) ' +
  'LEFT JOIN toppings t ON (entry.toppings_id = t.toppings_id) ' +
  'RIGHT JOIN image i ON (entry.entry_id = i.entry_id) ' +
  'WHERE entry.entry_id = ? ' +
  'AND i.image_type = "' + imagesTypes.detail + '"';

// Missing entry_id and entry_url
const stubbedMockListEntry = {
  entry_name: 'Generic Ramen',
  image: '../assets/ramen.jpg',
  restaurant_name: 'Generic Ramen Restaurant',
  restaurant_url: 'http://www.google.com'
};

// Missing entry_id
const stubbedMockEntry = {
  entry_name: 'Generic Ramen',
  image: '../assets/ramen.jpg',
  restaurant_name: 'Generic Ramen Restaurant',
  restaurant_url: 'http://www.google.com',
  city: 'Mountain View',
  state: 'CA',
  lat: 37.4222801,
  lng: -122.0927588,
  entry_date: '14/03/2018',
  rating: 3.8,
  noodles: 'Thin, straight',
  noodles_rating: 3.0,
  broth: 'Shoyu',
  broth_rating: 4.5,
  toppings: 'Egg, pork belly, nori, bamboo shoots',
  toppings_rating: 4.0,
  notes: ['Blah blah blah something about the ramen.',
   'Blah blah blah more stuff about the ramen.',
   'I think 3 sections is good enough for now.']
};

let Entries = function () {
  let dbConn;
  if (!config.entries.mock) {
    dbConn = mysql.createConnection(config.mysql); // Note: user defined in the config should be read-only
    dbConn.connect(); // When to end connection?
  }

  function generateMockEntries() {
    const numEntries = 25;
    let entries = [];
    for (let entryId = numEntries; entryId < numEntries + numEntriesPerPage; entryId++) {
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
    return '/' + entry.entry_id /*+ '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-')*/;
  }

  function parseNotes(notes) {
    return notes.split(notesSeparator);
  }

  this.getEntries = (page, res) => {
    if (!config.entries.mock) {
      dbConn.query(selectListQuery, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.send([]);
        } else {
          rows.forEach((entry) => {
            entry.entry_url = constructEntryUrl(entry);
          });
          res.send(rows);
        }
      });
    } else {
      res.send(generateMockEntries());
    }
  };

  this.getEntry = (entryId, res) => {
    if (!config.entries.mock) {
      dbConn.query(selectEntryQuery, [entryId], (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.send({});
        } else {
          if (rows.length) {
            const tempEntry = rows[0];
            let entry = Object.assign({}, tempEntry);
            entry.notes = parseNotes(tempEntry.notes);
            res.send(entry);
          } else {
            res.send({});
          }
        }
      });
    } else {
      res.send(generateMockEntry(entryId));
    }
  };
};

module.exports = new Entries();