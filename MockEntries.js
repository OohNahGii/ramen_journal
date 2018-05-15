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

let MockEntries = function () {
  function generateMockEntries() {
    const numEntries = 25;
    let entries = [];
    for (let entryId = 1; entryId <= numEntries; entryId++) {
      entries.push(Object.assign({
        entry_id: entryId,
        entry_url: '/' + entryId
      }, stubbedMockListEntry));
    }
    return entries;
  }

  function generateMockEntry(entryId) {
    return Object.assign({entry_id: entryId}, stubbedMockEntry);
  }

  this.connect = () => {

  };

  this.getEntries = (res) => {
    res.send(generateMockEntries());
  };

  this.getEntry = (entryId, res) => {
    res.send(generateMockEntry(entryId));
  };
};

module.exports = new MockEntries();