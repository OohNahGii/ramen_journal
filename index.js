const express = require('express');
const entries = require('./entries.js');
const config = require('./config.json');
const app = express();

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
  const page = req.query.page;
  if (!page || !isNaturalNumber(page)) {
    res.send([]);
  } else {
    entries.getEntries(page, res);
  }
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