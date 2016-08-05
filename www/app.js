
var cApp = angular.module('censusApp', ['angular-loading-bar']);
cApp.controller('mainCtrl', mainController);

mainController.$inject = ['$http'];

function mainController($http) {
  var mCtrl = this;
  mCtrl.title = 'Census App';

  mCtrl.showFinished = false;

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


    $http({
      url: '/mapquest',
      method: 'POST',
      data: { street : mCtrl.street, city : mCtrl.city, state : mCtrl.state }
    })
      .then(function(response) {
        var lat = response.data.results[0].locations[0].latLng.lat;
        var lng = response.data.results[0].locations[0].latLng.lng;

        $http({
          url : 'census-layer',
          method: 'POST',
          data: { lat : lat, lng : lng }
        })
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
              } else if ('PLACEFP' in response.data.features[i].properties) {
                mCtrl.placeID = response.data.features[i].properties.PLACEFP;
                mCtrl.placeName = response.data.features[i].properties.NAMELSAD;
              }

            }
            console.log('State: ', mCtrl.stateID,'County: ', mCtrl.countyID, 'Place: ', mCtrl.placeID);

            // Get Place Population Estimate
            $http({
              url: '/api/population-estimate',
              method: 'POST',
              data: {
                stateID: mCtrl.stateID,
                countyID: mCtrl.countyID,
                placeID: mCtrl.placeID
              }
            })
              .then(function(response) {
                console.log('Census: ', response, 'County: ', response.data[1][0])
                mCtrl.placePopulation = response.data[1][0];
              })

            // Get Components of Change
            $http({
              url: '/api/components-of-change',
              method: 'POST',
              data: {
                stateID: mCtrl.stateID,
                countyID: mCtrl.countyID,
                placeID: mCtrl.placeID
              }
            })
              .then(function(response) {
                console.log('Components of Change: ', response)
                mCtrl.GEONAME = response.data[1][0];
                mCtrl.BIRTHS = response.data[1][1];
                mCtrl.DEATHS = response.data[1][2];
                mCtrl.RBIRTH = response.data[1][3];
                mCtrl.RDEATH = response.data[1][4];
                mCtrl.DOMESTICMIG = response.data[1][5];
                mCtrl.INTERNATIONALMIG = response.data[1][6];
                mCtrl.NATURALINC = response.data[1][7];
                mCtrl.NETMIG = response.data[1][8];
                mCtrl.RDOMESTICMIG = response.data[1][9];
                mCtrl.RESIDUAL = response.data[1][10];
                mCtrl.RINTERNATIONALMIG = response.data[1][11];
                mCtrl.RNATURALINC = response.data[1][12];
                mCtrl.RNETMIG = response.data[1][13];
                mCtrl.LASTUPDATE = response.data[1][14];
              })

            // Get Characteristics By Age Group
            $http({
              url: '/api/characteristics-by-age-group',
              method: 'POST',
              data: {
                stateID: mCtrl.stateID,
                countyID: mCtrl.countyID,
                placeID: mCtrl.placeID
              }
            })
              .then(function(response) {
                console.log('Characteristics By Age Group: ', response)
                mCtrl.totalOnePopulation = 0;
                mCtrl.totalTwoPopulation = 0;
                mCtrl.totalThreePopulation = 0;
                for (var i = 0; i < response.data.length; i++) {
                  console.log(response.data[i][2])
                  if ((i !== 1) && response.data[i][2] == 0) {
                    console.log('One +' + response.data[i][0])
                    mCtrl.totalOnePopulation = mCtrl.totalOnePopulation + parseInt(response.data[i][0]);
                  } else if ((i !== 1) && response.data[i][2] == 1) {
                    console.log('Two +' + response.data[i][0])
                    mCtrl.totalTwoPopulation = mCtrl.totalTwoPopulation + parseInt(response.data[i][0]);
                  } else if ((i !== 1) && response.data[i][2] == 2) {
                    console.log('Three +' + response.data[i][0])
                    mCtrl.totalThreePopulation = mCtrl.totalThreePopulation + parseInt(response.data[i][0]);
                  }
                }

                // mCtrl.totalFemalePopulation = response.data[3][0];
                // mCtrl.femalePopulationPercentage = (response.data[3][0] / response.data[1][0]) * 100;
                // mCtrl.totalMalePopulation = response.data[2][0];
                // mCtrl.malePopulationPercentage = (response.data[2][0] / response.data[1][0]) * 100;

                mCtrl.showFinished = true;
                $('#collapseOne').collapse('show')
              })


          })
      })
  }
}
