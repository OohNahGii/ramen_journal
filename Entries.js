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

class Entries {
  async connect() {
    // Catch failed connections separately so that we can still attempt to query the db/cache later.
    // This handles the case where the cache might be down but the db is up and vice versa.
    // In the case where only the db is down. we are okay retrieving from cache only since the cached data
    // should be long-lived and will most likely never change.
    if (!db.isConnected()) {
      try {
        await db.connect(config.mysql);
      } catch (error) {
        console.log(error);
      }
    }
    if (!cache.isConnected()) {
      try {
        await cache.connect();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getEntries(res) {
    console.log('Attempting to retrieve entries from cache');
    let entries = null;
    try {
      entries = await cache.get(listCacheKey);
    } catch (error) {
      console.log(error);
    }

    if (entries) {
      console.log('Successfully retrieved entries from cache');
      res.send(JSON.parse(entries));
    } else {
      console.log('Attempting to retrieve entries from db');
      try {
        entries = await db.query(selectListQuery);
      } catch (error) {
        console.log(error);
        res.send([]);
        return; // Exit early. Todo: figure out cleaner way to do this
      }

      console.log('Successfully retrieved entries from db');
      entries.forEach(entry => {
        entry.entry_url = this._constructEntryUrl(entry);
      });

      console.log('Attempting to set entries in cache');
      try {
        await cache.set(listCacheKey, JSON.stringify(entries));
      } catch (error) {
        console.log(error);
      }
      res.send(entries);
    }
  }

  async getEntry(entryId, res) {
    const cacheKey = this._constructEntryCacheKey(entryId);
    let entry = null;

    console.log('Attempting to retrieve entry:' + entryId + ' from cache');
    try {
      entry = await cache.get(cacheKey);
    } catch (error) {
      console.log(error);
    }

    if (entry) {
      console.log('Successfully retrieved entry:' + entryId + ' from cache');
      res.send(JSON.parse(entry));
    } else {
      console.log('Attempting to retrieve entry:' + entryId + ' from db');
      let rows = null;
      try {
        rows = await db.query(selectEntryQuery, [entryId]);
      } catch (error) {
        console.log(error);
        res.send({});
        return; // Exit early. Todo: figure out cleaner way to do this
      }

      if (rows.length) {
        console.log('Successfully retrieved entry:' + entryId + ' from db');
        const tempEntry = rows[0];
        entry = Object.assign({}, tempEntry);
        entry.notes = this._parseNotes(tempEntry.notes);

        console.log('Attempting set retrieve entry:' + entryId + ' in cache');
        try {
          await cache.set(cacheKey, JSON.stringify(entry));
        } catch (error) {
          console.log(error);
        }
        res.send(entry);
      } else {
        console.log('No entry found with id:' + entryId);
        res.send({});
      }
    }
  }

  _constructEntryUrl(entry) {
    return '/' + entry.entry_id /*+ '-' + entry.entry_name.trim().toLowerCase().replace(' ', '-')*/;
  }

  _parseNotes(notes) {
    return notes.split(notesSeparator);
  }

  _constructEntryCacheKey(entryId) {
    return entryCacheKey + entryId;
  }
}

module.exports = new Entries();