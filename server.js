'use strict';

// app dependencies
const express = require('express');
// const superagent = require('superagent');

// load environment variables from .env files
require ('dotenv').config();

// app setup
const PORT = process.env.PORT || 4000;
const app = express();


app.use(express.static('public'));
app.use(express.static('public/styles'))

app.set('view engine', 'ejs')

//view routes
//just the test for proof of life
app.get('/', (request, response) => {
  response.render('pages/index');
})

app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));


function getLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError); //look into geoerror
  } else {
    codeLatLng(lat, lng); // message to prompt for manual entry
  }
}

function geoSuccess(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  alert(`lat: ${lat} lng: ${lng}`);
  cityLocation(lat, lng);
}


cityLocation (lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true&key${process.env.GEOCODE_API_KEY}`; 
  //Run through constructor to add info



  return superagent.get(url)
    .then(result => {
      const location = new Location(result); //remove this.query.. will need to add when user input is added 
      // location.save()
      (location => response.send(location));
    })
  }

function Location(res) {
  this.tableName = 'locations';
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.created_at = Date.now();
  this.cityName = res.body.results[0].address_components[2].long_name;
  this.countryName = res.body.results[0].address_components[6].long_name;



}


// function geoError() {
//   alert("Geocoder failed.");
// }