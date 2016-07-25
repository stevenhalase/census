'use strict'

const request = require('request');
const bodyParser = require('body-parser');
const logger = require('morgan');
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

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
///// API Mapquest Route
app.post('/mapquest', function(req, res) {
  console.log(req.body)
  let mapQuestKey = 'Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr';
  let mapquestQuery = 'http://www.mapquestapi.com/geocoding/v1/address?key=Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr&inFormat=json&json={"location":{"street": "' + req.body.street + '","city":"' + req.body.city + '","state":"' + req.body.state + '"}}'

  request(mapquestQuery , function (error, response, body) {
    if(error) { console.log(error) }
    console.log(response.body)
    res.send(response.body)
  })
})
///// API Census Layer Route
app.post('/census-layer', function(req, res) {
  console.log(req.body)
  let layerQuery = 'http://census.codeforamerica.org/areas?lat=' + req.body.lat + '&lon=' + req.body.lng + '&layers=state,county,cbsa,zcta510'
  request(layerQuery , function (error, response, body) {
    if(error) { console.log(error) }
    console.log(response.body)
    res.send(response.body)
  })
})
///// Set up server listening port
app.listen(port, function () {
    console.log('Server started at http://localhost:' + port)
})
