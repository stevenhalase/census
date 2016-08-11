
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
  mCtrl.ageGroupDefinition = [];

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
              // console.log('Components of Change: ', response)
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
            url: '/api/characteristics-by-age-group/gender',
            method: 'POST',
            data: {
              stateID: mCtrl.stateID,
              countyID: mCtrl.countyID,
              placeID: mCtrl.placeID
            }
          })
            .then(function(response) {
              // console.log('Characteristics By Age Group: ', response)
              mCtrl.totalBothPopulation = 0;
              mCtrl.totalMalePopulation = 0;
              mCtrl.totalFemalePopulation = 0;

              // Get Total Population By Gender
              for (var i = 0; i < response.data.length; i++) {
                // console.log(response.data[i][2])
                if ((i !== 0 || 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 0) {
                  // console.log('Both Before Total+', mCtrl.totalBothPopulation)
                  mCtrl.totalBothPopulation += parseInt(response.data[i][0]);
                  // console.log('Both Total+', mCtrl.totalBothPopulation, 'Adding+', response.data[i][0])
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) && (response.data[i][3] <= 18)  && response.data[i][2] == 1) {
                  mCtrl.totalMalePopulation += parseInt(response.data[i][0]);
                  // console.log('Male Total+', mCtrl.totalMalePopulation, 'Adding+', response.data[i][0])
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) && (response.data[i][3] <= 18)  && response.data[i][2] == 2) {
                  mCtrl.totalFemalePopulation += parseInt(response.data[i][0]);
                  // console.log('Female Total+', mCtrl.totalFemalePopulation, 'Adding+', response.data[i][0])
                }
              }

              // Create and Populate Age/Gender Group Array
              mCtrl.ageGroupDefinition = [
                'All ages',
                '0 to 4 years',
                '5 to 9 years',
                '10 to 14 years',
                '15 to 19 years',
                '20 to 24 years',
                '25 to 29 years',
                '30 to 34 years',
                '35 to 39 years',
                '40 to 44 years',
                '45 to 49 years',
                '50 to 54 years',
                '55 to 59 years',
                '60 to 64 years',
                '65 to 69 years',
                '70 to 74 years',
                '75 to 79 years',
                '80 to 84 years',
                '85 years and older',
                'Under 18 years',
                '5 to 13 years',
                '14 to 17 years',
                '18 to 64 years',
                '18 to 24 years',
                '25 to 44 years',
                '45 to 64 years',
                '65 years and over',
                '85 years and over',
                '16 years and over',
                '18 years and over',
                '15 to 44 years',
                'Median age'
              ]
              mCtrl.maleAgeGroups = [];
              mCtrl.femaleAgeGroups = [];
              let holderObj = {};
              for (var i = 0; i < response.data.length; i++) {
                // Selecting male age groups
                if ((i !== 0 || 1) && (response.data[i][3] > 0 ) && (response.data[i][3] <= 18 ) && response.data[i][2] == 1) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    gender: 'Male'
                  }
                  mCtrl.maleAgeGroups.push(holderObj);
                }
                // Selecting female age groups
                else if ((i !== 0 || 1) && (response.data[i][3] > 0 ) && (response.data[i][3] <= 18 ) && response.data[i][2] == 2) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    gender: 'Female'
                  }
                  mCtrl.femaleAgeGroups.push(holderObj);
                }
              }

              // console.log('Male groups: ', mCtrl.maleAgeGroups);
              // console.log('Female groups: ', mCtrl.femaleAgeGroups);

              mCtrl.maleMedianAge = response.data[64][0];
              mCtrl.femaleMedianAge = response.data[96][0];
              // mCtrl.malePopulationPercentage = response.data[i][2];
              // mCtrl.femalePopulationPercentage = response.data[i][2];

              // mCtrl.totalFemalePopulation = response.data[3][0];
              // mCtrl.femalePopulationPercentage = (response.data[3][0] / response.data[1][0]) * 100;
              // mCtrl.totalMalePopulation = response.data[2][0];
              // mCtrl.malePopulationPercentage = (response.data[2][0] / response.data[1][0]) * 100;

              mCtrl.showFinished = true;
              $('#collapseOne').collapse('show')
            })

          $http({
            url: '/api/characteristics-by-age-group/race',
            method: 'POST',
            data: {
              stateID: mCtrl.stateID,
              countyID: mCtrl.countyID,
              placeID: mCtrl.placeID
            }
          })
            .then(function(response) {
              // console.log('Race groups: ', response.data);
              // Get Total Population By Gender
              mCtrl.whiteTotal = 0;
              mCtrl.whiteAgeGroups = [];
              mCtrl.blackAgeGroups = [];
              mCtrl.blackTotal = 0;
              mCtrl.americanIndianAlaskanNativeAgeGroups = [];
              mCtrl.americanIndianAlaskanNativeTotal = 0;
              mCtrl.asianAgeGroups = [];
              mCtrl.asianTotal = 0;
              mCtrl.nativeHawaiianOtherPacificAgeGroups = [];
              mCtrl.nativeHawaiianOtherPacificTotal = 0;
              let holderObj = {};
              for (var i = 0; i < response.data.length; i++) {
                if ((i !== 0 || i !== 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 1) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    race: 'White'
                  }
                  mCtrl.whiteTotal += parseInt(response.data[i][0]);
                  mCtrl.whiteAgeGroups.push(holderObj);
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 2) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    race: 'Black'
                  }
                  mCtrl.blackTotal += parseInt(response.data[i][0]);
                  mCtrl.blackAgeGroups.push(holderObj);
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 3) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    race: 'American Indian / Alaskan Native'
                  }
                  mCtrl.americanIndianAlaskanNativeTotal += parseInt(response.data[i][0]);
                  mCtrl.americanIndianAlaskanNativeAgeGroups.push(holderObj);
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 4) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    race: 'Asian'
                  }
                  mCtrl.asianTotal += parseInt(response.data[i][0]);
                  mCtrl.asianAgeGroups.push(holderObj);
                } else if ((i !== 0 || 1) &&  (response.data[i][3] > 0) &&  (response.data[i][3] <= 18) && response.data[i][2] == 5) {
                  holderObj = {
                    ageGroup: mCtrl.ageGroupDefinition[response.data[i][3]],
                    value: response.data[i][0],
                    race: 'Native Hawaiian / Other Pacific Islander'
                  }
                  mCtrl.nativeHawaiianOtherPacificTotal += parseInt(response.data[i][0]);
                  mCtrl.nativeHawaiianOtherPacificAgeGroups.push(holderObj);
                }
              }
            })

            $http({
              url: '/api/characteristics-by-age-group/age',
              method: 'POST',
              data: {
                stateID: mCtrl.stateID,
                countyID: mCtrl.countyID,
                placeID: mCtrl.placeID
              }
            })
              .then(function(response) {
                // console.log('Age groups: ', response.data);
                mCtrl.ageGroups = [];
                mCtrl.extendedAgeGoups = [];

                // Create and Populate Age/Gender Group Array
                mCtrl.ageGroupDefinition = [
                  'All ages',
                  '0 to 4 years',
                  '5 to 9 years',
                  '10 to 14 years',
                  '15 to 19 years',
                  '20 to 24 years',
                  '25 to 29 years',
                  '30 to 34 years',
                  '35 to 39 years',
                  '40 to 44 years',
                  '45 to 49 years',
                  '50 to 54 years',
                  '55 to 59 years',
                  '60 to 64 years',
                  '65 to 69 years',
                  '70 to 74 years',
                  '75 to 79 years',
                  '80 to 84 years',
                  '85 years and older',
                  'Under 18 years',
                  '5 to 13 years',
                  '14 to 17 years',
                  '18 to 64 years',
                  '18 to 24 years',
                  '25 to 44 years',
                  '45 to 64 years',
                  '65 years and over',
                  '85 years and over',
                  '16 years and over',
                  '18 years and over',
                  '15 to 44 years',
                  'Median age'
                ]

                let holderObj = {};
                for (var i = 0; i < response.data.length; i++) {
                  // Selecting male age groups
                  if (i !== 0 && i < 20) {
                    holderObj = {
                      ageGroup: mCtrl.ageGroupDefinition[i-1],
                      value: response.data[i][0],
                    }
                    mCtrl.ageGroups.push(holderObj);
                  } else if (i !== 0 && i >= 20){
                    holderObj = {
                      ageGroup: mCtrl.ageGroupDefinition[i-1],
                      value: response.data[i][0],
                    }
                    mCtrl.extendedAgeGoups.push(holderObj);
                  }
                }
                // console.log(mCtrl.ageGroups)

              })





          })
      })
  }
}
