const express = require('express');
const config = require('./config.json');
const app = express();

let entries;
if (config.entries.mock) {
  entries = require('./MockEntries');
} else {
  entries = require('./Entries');
}

function isNaturalNumber(str) {
  let num = Math.floor(Number(str));
  return num !== Infinity && String(num) === str && num >= 0;
}

// For testing purposes
if (config.local) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
  });
}


app.get('/entries', async (req, res) => {
  try {
    await entries.connect();
    await entries.getEntries(res);
  } catch (error) {
    console.log(error);
    res.send([]);
  }
});

app.get('/entries/:entryId', async (req, res) => {
  try {
    const entryId = req.params.entryId;
    if (!isNaturalNumber(entryId)) {
      res.send({});
    } else {
      await entries.connect();
      await entries.getEntry(entryId, res);
    }
  } catch (error) {
    console.log(error);
    res.send({});
  }
});

module.exports = app;