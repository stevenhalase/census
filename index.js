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
  // console.log(req.body)
  let mapQuestKey = 'Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr';
  let mapquestQuery = 'http://www.mapquestapi.com/geocoding/v1/address?key=Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr&inFormat=json&json={"location":{"street": "' + req.body.street + '","city":"' + req.body.city + '","state":"' + req.body.state + '"}}'

  request(mapquestQuery , function (error, response, body) {
    if(error) { console.log(error) }
    // console.log(response.body)
    res.send(response.body)
  })
})
///// API Census Layer Route
app.post('/census-layer', function(req, res) {
  // console.log(req.body)
  let layerQuery = 'http://census.codeforamerica.org/areas?lat=' + req.body.lat + '&lon=' + req.body.lng + '&layers=state,county,place,zcta510'
  request(layerQuery , function (error, response, body) {
    if(error) { console.log(error) }
    // console.log(response.body)
    res.send(response.body)
  })
})
///// API Place Population Estimate
app.post('/api/population-estimate', function(req, res) {
  console.log(req.body);
  let censusKey = '6c7cd8a681e867881692945c8265e00d5f76b7ba';
  let popEstQuery = 'https://api.census.gov/data/2015/pep/population?get=POP,GEONAME&for=PLACE:' + req.body.placeID + '&in=state:' + req.body.stateID + '+county:' + req.body.countyID + '&key=' + censusKey;
  request(popEstQuery , function (error, response, body) {
    if(error){console.log('Error: ', error)};
    // console.log('Body: ', body);
    res.send(body);
  })
})
///// API County Deaths Estimate
app.post('/api/components-of-change', function(req, res) {
  console.log(req.body);
  let censusKey = '6c7cd8a681e867881692945c8265e00d5f76b7ba';
  let popEstQuery = 'https://api.census.gov/data/2015/pep/components?get=GEONAME,BIRTHS,DEATHS,RBIRTH,RDEATH,DOMESTICMIG,INTERNATIONALMIG,NATURALINC,NETMIG,RDOMESTICMIG,RESIDUAL,RINTERNATIONALMIG,RNATURALINC,RNETMIG,LASTUPDATE&for=COUNTY:' + req.body.countyID + '&in=state:' + req.body.stateID + '&key=' + censusKey;
  request(popEstQuery , function (error, response, body) {
    if(error){console.log('Error: ', error)};
    console.log('Body: ', body);
    res.send(body);
  })
})
///// API County Characteristics By Age Group / Gender
app.post('/api/characteristics-by-age-group/gender', function(req, res) {
  console.log(req.body);
  let censusKey = '6c7cd8a681e867881692945c8265e00d5f76b7ba';
  let popEstQuery = 'https://api.census.gov/data/2015/pep/charagegroups?get=POP,GEONAME,SEX,AGEGROUP&for=COUNTY:' + req.body.countyID + '&in=state:' + req.body.stateID + '&key=' + censusKey;
  request(popEstQuery , function (error, response, body) {
    if(error){console.log('Error: ', error)};
    console.log('Body: ', body);
    res.send(body);
  })
})
///// API County Characteristics By Age Group / Race
app.post('/api/characteristics-by-age-group/race', function(req, res) {
  console.log(req.body);
  let censusKey = '6c7cd8a681e867881692945c8265e00d5f76b7ba';
  let popEstQuery = 'https://api.census.gov/data/2015/pep/charagegroups?get=POP,GEONAME,RACE,AGEGROUP&for=COUNTY:' + req.body.countyID + '&in=state:' + req.body.stateID + '&key=' + censusKey;
  request(popEstQuery , function (error, response, body) {
    if(error){console.log('Error: ', error)};
    console.log('Body: ', body);
    res.send(body);
  })
})
///// Set up server listening port
app.listen(port, function () {
    console.log('Server started at http://localhost:' + port)
})
