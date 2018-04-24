const db = require('./PromiseDatabase');
const cache = require('./PromiseCache');
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
  // Connect to db and cache
  db.connect(config.mysql); // Note: user defined in the config should be read-only
  cache.connect();

  function constructEntryUrl(entry) {
    return '/' + entry.entry_id /*+ '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-')*/;
  }

  function parseNotes(notes) {
    return notes.split(notesSeparator);
  }

  function constructEntryCacheKey(entryId) {
    return entryCacheKey + entryId;
  }

  this.getEntries = async (res) => {
    try {
      const cacheEntries = await cache.get(listCacheKey);
      if (cacheEntries) {
        res.send(JSON.parse(cacheEntries));
      } else {
        const rows = await db.query(selectListQuery);
        rows.forEach(entry => {
          entry.entry_url = constructEntryUrl(entry);
        });
        await cache.set(listCacheKey, JSON.stringify(rows));
        res.send(rows);
      }
    } catch (error) {
      console.log(error);
      res.send([]);
    }
  };

  this.getEntry = async (entryId, res) => {
    const cacheKey = constructEntryCacheKey(entryId);
    try {
      const cacheEntry = await cache.get(cacheKey);
      if (cacheEntry) {
        res.send(JSON.parse(cacheEntry));
      } else {
        const rows = await db.query(selectEntryQuery, [entryId]);
        if (rows.length) {
          const tempEntry = rows[0];
          let entry = Object.assign({}, tempEntry);
          entry.notes = parseNotes(tempEntry.notes);
          await cache.set(cacheKey, JSON.stringify(entry));
          res.send(entry);
        } else {
          console.log('No entry found with id:' + entryId);
          res.send({});
        }
      }
    } catch (error) {
      console.log(error);
      res.send({});
    }
  };
};

module.exports = new Entries();