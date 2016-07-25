
var cApp = angular.module('censusApp', ['angular-loading-bar']);
cApp.controller('mainCtrl', mainController);

mainController.$inject = ['$http'];

function mainController($http) {
  var mCtrl = this;
  mCtrl.title = 'Census App';

  mCtrl.location = '';
  mCtrl.stateName = '';
  mCtrl.stateID = '';
  mCtrl.municipalityName = '';
  mCtrl.municipalityID = '';
  mCtrl.countyName = '';
  mCtrl.countyID = '';
  mCtrl.zipCode = '';
  mCtrl.countyPopulation = '';

  mCtrl.getData = function() {
    console.log(mCtrl.location)
    var mapQuestKey = 'Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr';
    var mapquestQuery = 'http://www.mapquestapi.com/geocoding/v1/address?key=Q6kWF9IYQkgFceAaU4R1prbAeWkzMVLr&inFormat=json&json={"location":{"street": "' + mCtrl.street + '","city":"' + mCtrl.city + '","state":"' + mCtrl.state + '"}}'

    $http.get(mapquestQuery)
      .then(function(response) {
        var lat = response.data.results[0].locations[0].latLng.lat;
        var lng = response.data.results[0].locations[0].latLng.lng;

        $http.get('http://census.codeforamerica.org/areas?lat=' + lat + '&lon=' + lng + '&layers=state,county,cbsa,zcta510')
        // $http.get('http://census.codeforamerica.org/areas?lat=37.775793&lon=-122.413549')
          .then(function(response) {
            console.log('GEOCODE : ', response.data.features)
            for (var i = 0; i < response.data.features.length; i++) {
              if (response.data.features[i].properties.LSAD === 'M1') {
                mCtrl.municipalityName = response.data.features[i].properties.NAME;
                mCtrl.municipalityID = response.data.features[i].properties.GEOID;
              } else if (response.data.features[i].properties.LSAD === '00') {
                mCtrl.stateName = response.data.features[i].properties.NAME;
                mCtrl.stateID = response.data.features[i].properties.GEOID;
              } else if (response.data.features[i].properties.LSAD === '06') {
                mCtrl.countyName = response.data.features[i].properties.NAME;
                mCtrl.countyID = response.data.features[i].properties.COUNTYFP;
              } else if ('ZCTA5CE10' in response.data.features[i].properties) {
                mCtrl.zipCode = response.data.features[i].properties.ZCTA5CE10;
              }
            }

            var censusKey = '6c7cd8a681e867881692945c8265e00d5f76b7ba';
            $http.get('https://api.census.gov/data/2015/pep/population?get=POP,GEONAME&for=COUNTY:' + mCtrl.countyID + '&in=state:' + mCtrl.stateID + '&DATE=8&key=' + censusKey)
              .then(function(response) {
                console.log('Census: ', response)
                mCtrl.countyPopulation = response.data[1][0];
              })
          })
      })
  }
}
