'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg')

// load environment variables from .env files
require ('dotenv').config();

// app setup
const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors())

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(express.static('public/styles'))

//db config
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.set('view engine', 'ejs')

//view routes
app.get('/', (request, response) => {
  response.render('pages/index');
})

//routes
app.post('/location', getLocation);
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));



function getLocation (request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.city}&key=${process.env.GEOCODE_API_KEY}`; 
  //Run through constructor to add info

  return superagent.get(url)
    .then(res => {
      const location = new Location(request.body.city, res);
      location.save()
        .then(location => response.send(location));
    })
    .catch(error => handleError(error));
}

function Location(query, res) {
  this.tableName = 'locations';
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.cityName = query;
  this.countryName = res.body.results[0].address_components[2].long_name;
}

Location.tableName = 'locations';

Location.prototype.save = function () {
  const SQL = `INSERT INTO locations (city_name, country_name, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id;`;
  const values = [this.cityName, this.countryName, this.latitude, this.longitude];

  return client.query(SQL, values)
    .then(result => {
      this.id = result.rows[0].id;
      return this;
    });
}

//weather model
// <<<< TODO - adjust this. to be accurate to information we care about
// function Weather(day) {
//   this.tableName = 'weather';
//   this.created_at = Date.now();
//   this.time = new Date(day.time * 1000).toString().slice(0, 15);
//   this.forecast = day.summary;
// }

// function Yelp(attraction) {
//   this.tableName = 'attraction';
//   this.created_at = Date.now();
//   this.name =
//   this.url = 
//   this.rating =
//   this.address =
// }

//helper functions
function lookup(options) {
  const SQL =  `SELECT * FROM ${options.tableName} WHERE location_id=$1;`;
  const values = [options.location];

  client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        options.cache
      }
    })
}

function handleError(err, res) {
  console.error(err);
  if (res) res.satus(500).send('Error encountered.');
}
