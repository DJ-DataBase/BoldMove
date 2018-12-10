'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

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
app.get('/menu', (request, response) => {
  response.render('pages/menu');
})
app.get('/translate', (request, response) => {
  response.render('pages/translateNew')
})
app.get('/yelp', showYelpForm);
app.get('/weather', getWeather);
app.get('/currency', currencyPage);
app.get('/aboutus', showAboutUs);
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

//routes
app.post('/yelpSearch', showYelpResults);
app.post('/yelpAdd', addYelptoSave);
app.post('/yelpDelete/:yelp_id',deleteYelp);
app.post('/location', getLocation);
app.post('/translate', getTranslation);
app.post('/currency', currencyConvert);
// app.post('/currencyForm', currencyPage);

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//global variable
let currentLocation = '';

//constructors/models
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
}

RestCountryObj.prototype.save = function (location_name) {
  const SQL = `UPDATE locations SET currency_code=$1, currency_symbol=$2, lang_code=$3 WHERE country_name=$4;`;
  const values = [this.currencyCode, this.currencySymbol, this.languageCode, location_name];

  return client.query(SQL, values)
}

function Weather(day) {
  this.tableName = 'forecasts';
  this.currentTemp = Math.round(day.currently.temperature);
  this.currentSummary = day.currently.summary;
  this.currentPrecip = Math.round(day.currently.precipProbability * 100);
  this.currentCloudCover = Math.round(day.currently.cloudCover * 100);
  this.currentVisibility = Math.round(day.currently.visibility);
  this.currentHumidity = Math.round(day.currently.humidity * 100);
  this.currentWindSpeed = Math.round(day.currently.windSpeed);
  this.tomorrowHigh = Math.round(day.daily.data[1].temperatureHigh);
  this.tomorrowLow = Math.round(day.daily.data[1].temperatureLow);
  this.tomorrowSummary = day.daily.data[1].summary;
  this.tomorrowPrecip = Math.round(day.daily.data[1].precipProbability * 100);
  this.tomorrowCloudCover = Math.round(day.daily.data[1].cloudCover * 100);
  this.tomorrowVisibility = Math.round(day.daily.data[1].visibility);
  this.tomorrowHumidity = Math.round(day.daily.data[1].humidity * 100);
  this.tomorrowWindSpeed = Math.round(day.daily.data[1].windSpeed);
  this.time = new Date(day.currently.time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}
Weather.tableName = 'forecasts';

Weather.prototype.save = function() {
  const SQL = `INSERT INTO ${this.tableName} (current_temp,  current_summary, current_precip, current_cloud_cover, current_visibility, current_humidity, current_wind_speed, tomorrow_high, tomorrow_low, tomorrow_summary, tomorrow_precip, tomorrow_cloud_cover, tomorrow_visibility, tomorrow_humidity, tomorrow_wind_speed, time, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`;
  const values = [this.currentTemp, this.currentSummary, this.currentPrecip, this.currentCloudCover, this.currentVisibility, this.currentHumidity, this.currentWindSpeed, this.tomorrowHigh, this.tomorrowLow, this.tomorrowSummary, this.tomorrowPrecip, this.tomorrowCloudCover, this.tomorrowVisibility, this.tomorrowHumidity, this.tomorrowWindSpeed, this.time, this.created_at,currentLocation];
  client.query(SQL, values);
}

function YelpObj(place) {
  this.tableName = 'yelp';
  this.url = place.url || 'No URL provided';
  this.name = place.name || 'No name provided';
  this.rating = place.rating || 'No rating provided';
  this.price = place.price || 'No price provided';
  this.image_url = place.image_url || '../img/No-picture.jpg';
  this.created_at = Date.now();
  // console.log('yelpobj', this);
}

function getWeather(request, response) {
  const SQL = `SELECT latitude, longitude FROM locations WHERE city_name = '${currentLocation}';`;
  client.query(SQL)
    .then(result => {
      // console.log('lat long result', result.rows[0]);
      // console.log('lat results', result.rows[0].latitude);
      const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API}/${result.rows[0].latitude},${result.rows[0].longitude}`;
      superagent.get(url)
        .then(result => {
          const weather = new Weather(result.body);
          // console.log(weather);
          weather.save();
          response.render('./pages/weather', {weather: weather});
        });
    })
    .catch(err => handleError(err));
}

//Helper functions
function currencyPage(req, res) {
  res.render('./pages/currency');
}

function showAboutUs (req, res) {
  res.render('./pages/aboutus');
}

function showYelpForm (req, res) {
  let SQL = 'SELECT * FROM yelp;';

  return client.query(SQL)
    .then(yelpDBRestuls => {
      res.render('pages/yelp', {yelpDBRestuls: yelpDBRestuls.rows})
    })
    .catch(error => handleError(error, res));
}

function getLocation (request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.city}&key=${process.env.GEOCODE_API_KEY}`;
  currentLocation = request.body.city;

  return superagent.get(url)
    .then(res => {
      const location = new Location(request.body.city, res);
      location.save()
        .then(getRestCountry(res.body.results[0].address_components[res.body.results[0].address_components.length - 1].long_name))
        .then(response.redirect('/menu'));
    })
    .catch(error => handleError(error));
}

function getRestCountry (country) {
  const url = `https://restcountries.eu/rest/v2/name/${country}?fullText=true`;
  return superagent.get(url)
    .then (results => {
      const restCountry = new RestCountryObj(results.body);
      restCountry.save(country);
    })
}

function getTranslation (request, response) {
  const SQL = `SELECT lang_code FROM locations WHERE city_name = '${currentLocation}';`;
  client.query(SQL)
    .then(result => {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API}&q=${request.body.pleaseTranslate}?&target=${result.rows[0].lang_code}`;
      superagent.post(url)
        .then(res => {
          let translatedString = res.body.data.translations[0].translatedText;
          let newTranString = translatedString.slice(0, translatedString.length - 1);
          response.render('./pages/translate.ejs', {translate: newTranString})
        });
    })
    .catch(error => handleError(error));
}

function currencyConvert (request, response) {
  const SQL = `SELECT DISTINCT currency_code, currency_symbol FROM locations WHERE city_name = '${currentLocation}';`;
  return client.query(SQL)
    .then(currencyCode => {
      let currSymbol = currencyCode.rows[0].currency_symbol;
      let currCode = currencyCode.rows[0].currency_code;
      const url = `https://currency-exchange.apphb.com/api/rates?apikey=a84e43b27f20e6645157b29a42f1a25c&provider=currencylayer&fr=USD&to=${currCode}`;
 
      superagent.get(url)
        .then(res => {
          let result = res.body * request.body.currencyReturn;
          let resultdec = result.toFixed(2);
          response.render('pages/currencyResult', {resultShow : '$'+ request.body.currencyReturn + ' is worth ' + resultdec + ' ' + currSymbol})
        })
        .catch(error => handleError(error, res));
    })
}

function showYelpResults (req, res) {
  let SQL = 'SELECT latitude, longitude FROM locations WHERE city_name=$1;';
  // let values = [req.params.city];
  let values = [currentLocation];

  client.query(SQL, values)
    .then( result => {
      const url = `https://api.yelp.com/v3/businesses/search?term=${req.body.yelpSearchInquiry}&latitude=${result.rows[0].latitude}&longitude=${result.rows[0].longitude}`;
      // console.log('yelp url', url);

      superagent.get(url)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(yelpResponse => {
          const yelpSummaries = yelpResponse.body.businesses.map(place => {
            return new YelpObj(place);
          });
          // console.log('yelpsummaries', yelpSummaries);
          res.render('pages/yelpresults',{searchResults: yelpSummaries})
        })
        .catch(error => handleError(error, res));
    })
}

function addYelptoSave (req, res) {
  let {name, created_at, rating, price, image_url, url} = req.body;

  let SQL = 'INSERT INTO yelp(name, created_at, rating, price, image_url, url) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [name, created_at, rating, price, image_url, url];
  // console.log('values!!!!!!!!!!!', values);
  return client.query(SQL, values)
    .then(res.redirect('/yelp'))
    .catch(handleError);
}

function deleteYelp (req, res) {
  let SQL = 'DELETE FROM yelp WHERE id=$1;';
  let values = [req.params.yelp_id];

  return client.query(SQL, values)
    .then(res.redirect('/yelp'))
    .catch(handleError);
}

function handleError(err, res) {
  console.error(err);
  if (res) res.satus(500).send('Error encountered.');
}

// Clear the DB data for a location if it is stale
function deleteByLocationId(table, city) {
  const SQL = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(SQL);
}

