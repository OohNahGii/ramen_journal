const express = require('express');
const entries = require('./entries.js');
const app = express();

function isNaturalNumber(str) {
  let num = Math.floor(Number(str));
  return num !== Infinity && String(num) === str && num >= 0;
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