'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');

// load environment variables from .env files
// require ('dotenv').config();

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
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  } else {
    codeLatLng(lat, lng);
  }
}

function geoSuccess(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  alert(`lat: ${lat} lng: ${lng}`);
  codeLatLng(lat, lng);
}


codeLatLng (lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true&key${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(result => {
      const location = new Location(this.query, result);
      // location.save()
      (location => response.send(location));
    })
  }

function Location(query, res) {
  this.city = 'results.address_components.short_name[3]';
  this.country = 'results.address_components.long_name[4]';
}


// function geoError() {
//   alert("Geocoder failed.");
// }