const express = require('express');
const config = require('./config.json');
const app = express();

let entries;
if (config.entries.mock) {
  entries = require('./MockEntries.js');
} else {
  entries = require('./Entries.js');
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


app.get('/entries', (req, res) => {
  entries.getEntries(res);
});

app.get('/entries/:entryId', (req, res) => {
  const entryId = req.params.entryId;
  if (!isNaturalNumber(entryId)) {
    res.send({});
  } else {
    entries.getEntry(entryId, res);
  }
});

app.listen(3000);