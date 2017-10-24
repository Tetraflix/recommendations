const express = require('express');
require('../database/movies/index.js');
require('../database/ratios/index.js');
// require('../database/dummydata');

const app = express();
const port = 3000;

app.post('/dummydata', (req, res) => {
  res.send('Received post request for dummy data');
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});
