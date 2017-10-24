const express = require('express');
require('../database/movies/index.js');
require('../database/sessions/index.js');

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`App is listening on Port ${port}!`);
});
