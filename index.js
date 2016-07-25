'use strict'

const request = require('request');
const bodyParser = require('body-parser');
const logger = require('morgan');
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

///// Parsing json
app.use(bodyParser.json());
///// Parsing urlencoded
app.use(bodyParser.urlencoded({extended: true}));
///// Serving static files from ./www
app.use(express.static(path.join(__dirname, './www')))
///// Route handler for homepage
app.get('/', function (req, res) {
  ///// Send homepage
  res.sendFile('index.html', {root : './www'})
});
///// Set up server listening port
app.listen(port, function () {
    console.log('Server started at http://localhost:' + port)
})
