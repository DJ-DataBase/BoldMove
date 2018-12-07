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
        .then(getRestCountry(res.body.results[0].address_components[res.body.results[0].address_components.length - 1].long_name))
        .then(location => response.send(location));
    })
    .catch(error => handleError(error));
}

function getRestCountry (country) {
  const url = `https://restcountries.eu/rest/v2/name/${country}?fullText=true`;
  console.log('country', country);
  return superagent.get(url)
    .then (results => {
      const restCountry = new RestCountryObj(results.body);
      restCountry.save(country);
    })


}

function Location(query, res) {
  this.tableName = 'locations';
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.cityName = query;
  this.countryName = res.body.results[0].address_components[res.body.results[0].address_components.length - 1].long_name;
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

function RestCountryObj(request) {
  this.currencyCode = request[0].currencies[0].code;
  this.currencySymbol = request[0].currencies[0].symbol;
  this.languageCode = request[0].languages[0].iso639_1;
  this.created_at = Date.now();
  console.log('restcountry object', this);
}
RestCountryObj.prototype.save = function (location_name) {
  console.log('in restcountry save function');
  const SQL = `UPDATE locations SET currency_code=$1, currency_symbol=$2, lang_code=$3 WHERE country_name=$4;`;
  const values = [this.currencyCode, this.currencySymbol, this.languageCode, location_name];

  return client.query(SQL, values)
  // .then(result => {
  //   this.id = result.rows[0].id;
  //   return this;
  // });
}
/////WEATHER//////////////////////////////////////////////////////////////
app.get('/pages/weather', getWeather);

function Weather(day) {
  this.tableName = 'forecasts';
  this.currentTemp = day.res[0].currently.temperature;
  this.currentPrecip = day.res[0].currently.precipProbability;
  this.currentSummary = day.res[0].currently.summary;
  this.tomorrowHigh = day.res[0].daily.data[0].temperatureHigh;
  this.tomorrowLow = day.res[0].daily.data[0].temperatureLow;
  this.tomorrowPrecip = day.res[0].daily.data[0].precipProbability;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}

Weather.tableName = 'forecasts';
Weather.lookup = lookup;
// Weather.deleteByLocationId = deleteByLocationId;

Weather.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (current_temp, current_precip, current_summary, tomorrow_high, tomorrow_low, tomorrow_precip, time, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
    const values = [this.currentTemp, this.currentPrecip, this.currentSummary, this.tomorrowHigh, this.tomorrowLow, this.tomorrowPrecip, this.time, this.created_at, this.location_id];

    client.query(SQL, values);
  }
}

function getWeather(request, response) {
  Weather.lookup({
    tableName: Weather.tableName,

    location: request.query.data.id,

    cacheHit: function (result) {
      let ageOfResultsInMinutes = (Date.now() - result.rows[0].created_at) / (1000 * 60);
      if (ageOfResultsInMinutes > 30) {
        // Weather.deleteByLocationId(Weather.tableName, request.query.data.id);
        this.cacheMiss();
      } else {
        response.send(result.rows);
      }
    },

    cacheMiss: function () {
      const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${-51.51},${-0.13}`;

      return superagent.get(url)
        .then(result => {
          const weatherSummaries = result.body.daily.data.map(day => {
            const summary = new Weather(day);
            summary.save(request.query.data.id);
            return summary;
          });
          response.send(weatherSummaries);
        })
        .catch(error => handleError(error, response));
    }
  })
}

// function deleteByLocationId(table, city) {
//   const SQL = `DELETE from ${table} WHERE location_id=${city};`;
//   return client.query(SQL);
// }



//////END WEATHER///////////////////////////////////////////////


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
  const SQL = `SELECT * FROM ${options.tableName} WHERE location_id=$1;`;
  const values = [options.location];

  client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        options.cacheHit(result);
      } else {
        options.cacheMiss();
      }
    })
    .catch(error => handleError(error));
}

function handleError(err, res) {
  console.error(err);
  if (res) res.satus(500).send('Error encountered.');
}
