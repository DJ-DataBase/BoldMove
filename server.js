'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

//  Load environment variables from .env file
require ('dotenv').config();

// Application Setup
const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors())
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(express.static('public/styles'))

// Database Setup | Config
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));
app.set('view engine', 'ejs')

//API routes
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

// Application routes
app.post('/yelpSearch', showYelpResults);
app.post('/yelpAdd', addYelptoSave);
app.post('/yelpDelete/:yelp_id',deleteYelp);
app.post('/location', getLocation);
app.post('/translate', getTranslation);
app.post('/currency', currencyConvert);

//  Make sure the server is listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Creating a global variable
let currentLocation = '';

// Location model
function Location(query, res) {
  this.tableName = 'locations';
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.cityName = query;
  this.countryName = res.body.results[0].address_components[res.body.results[0].address_components.length - 1].long_name;
}

// Declare location table thats in boldmove database
Location.tableName = 'locations';

// Save locations data inside locations table in boldmove database
Location.prototype.save = function () {
  const SQL = `INSERT INTO locations (city_name, country_name, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id;`;
  const values = [this.cityName, this.countryName, this.latitude, this.longitude];
  return client.query(SQL, values)
    .then(result => {
      this.id = result.rows[0].id;
      return this;
    });
}

//Select all data from locations table for the most recent user location
Location.lookupLocation = (location) => {
  const SQL = `SELECT * FROM locations WHERE city_name=$1;`;
  const values = [location.search];
  return client.query(SQL, values)
    .then(result => (result.rowCount > 0)?location.cacheHit():location.cacheMiss())
    .catch(console.error);
}

// Country model 
function RestCountryObj(request) {
  this.currencyCode = request[0].currencies[0].code;
  this.currencySymbol = request[0].currencies[0].symbol;
  this.languageCode = request[0].languages[0].iso639_1;
  this.languageName = request[0].languages[0].name;
  this.created_at = Date.now();
}

//Update data in the country table
RestCountryObj.prototype.save = function (location_name) {
  const SQL = `UPDATE locations SET currency_code=$1, currency_symbol=$2, lang_code=$3, lang_name=$4 WHERE country_name=$5;`;
  const values = [this.currencyCode, this.currencySymbol, this.languageCode, this.languageName, location_name];
  return client.query(SQL, values)
}

//Yelp model
function YelpObj(place) {
  this.tableName = 'yelp';
  this.url = place.url || 'No URL provided';
  this.name = place.name || 'No name provided';
  this.rating = place.rating || 'No rating provided';
  this.price = place.price || 'No price provided';
  this.image_url = place.image_url || '../img/No-picture.jpg';
  this.created_at = Date.now();
}

//Weather model
function Weather(day) {
  this.tableName = 'forecasts';
  this.current_temp = Math.round(day.currently.temperature);
  this.current_summary = day.currently.summary;
  this.current_precip = Math.round(day.currently.precipProbability * 100);
  this.current_cloud_cover = Math.round(day.currently.cloudCover * 100);
  this.current_visibility = Math.round(day.currently.visibility);
  this.current_humidity = Math.round(day.currently.humidity * 100);
  this.current_wind_speed = Math.round(day.currently.windSpeed);
  this.tomorrow_high = Math.round(day.daily.data[1].temperatureHigh);
  this.tomorrow_low = Math.round(day.daily.data[1].temperatureLow);
  this.tomorrow_summary = day.daily.data[1].summary;
  this.tomorrow_precip = Math.round(day.daily.data[1].precipProbability * 100);
  this.tomorrow_cloud_cover = Math.round(day.daily.data[1].cloudCover * 100);
  this.tomorrow_visibility = Math.round(day.daily.data[1].visibility);
  this.tomorrow_humidity = Math.round(day.daily.data[1].humidity * 100);
  this.tomorrow_wind_speed = Math.round(day.daily.data[1].windSpeed);
  this.time = new Date(day.currently.time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}

//Declaring weather table inside boldmove database
Weather.tableName = 'forecasts';

//Weather prototype to save information in forecasts table
Weather.prototype.save = function() {
  const SQL = `INSERT INTO ${this.tableName} (current_temp,  current_summary, current_precip, current_cloud_cover, current_visibility, current_humidity, current_wind_speed, tomorrow_high, tomorrow_low, tomorrow_summary, tomorrow_precip, tomorrow_cloud_cover, tomorrow_visibility, tomorrow_humidity, tomorrow_wind_speed, time, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`;
  const values = [this.current_temp, this.current_summary, this.current_precip, this.current_cloud_cover, this.current_visibility, this.current_humidity, this.current_wind_speed, this.tomorrow_high, this.tomorrow_low, this.tomorrow_summary, this.tomorrow_precip, this.tomorrow_cloud_cover, this.tomorrow_visibility, this.tomorrow_humidity, this.tomorrow_wind_speed, this.time, this.created_at,currentLocation];
  client.query(SQL, values);
}

//Pull weather data from forecast table
Weather.lookup = function (object) {
  const SQL = `SELECT * FROM ${this.tableName} WHERE location_id=$1;`;
  const values = [object.search];

  client.query(SQL, values) 
    .then(result => (result.rowCount > 0)?object.cacheHit(result):object.cacheMiss())
    .catch(error => handleError(error));
}

//Weather handler
function getWeather(request, response) {
  Weather.lookup({
    tableName: Weather.tableName,
    search: currentLocation,
    cacheHit: function (result) {

    let dataAgeInMinutes = (Date.now() - result.rows[0].created_at) / (1000 * 60);
       if (dataAgeInMinutes > 60) {
           deletebyLocation(Weather.tableName, currentLocation);
           this.cacheMiss();
      } else {
          const SQL = `SELECT * FROM forecasts WHERE location_id = '${currentLocation}';`;
          client.query(SQL)
          .then(result => {
            response.render('./pages/weather', {weather: result.rows[0]})
          })        
      }
    },
    cacheMiss: function () {
         const SQL = `SELECT latitude, longitude FROM locations WHERE city_name = '${currentLocation}';`;
          client.query(SQL)
          .then(result => {
          const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API}/${result.rows[0].latitude},${result.rows[0].longitude}`;
          superagent.get(url)
            .then(result => {
              const weather = new Weather(result.body);
              weather.save();
              response.render('./pages/weather', {weather: weather});
            });
        })
        .catch(err => handleError(err));
    }   
  })
}

//Yelp data handler
function showYelpForm (req, res) {
  let SQL = 'SELECT * FROM yelp;';
  return client.query(SQL)
    .then(yelpDBRestuls => {
      res.render('pages/yelp', {yelpDBRestuls: yelpDBRestuls.rows})
    })
    .catch(error => handleError(error, res));
}

//Location handler
function getLocation (request, response) {
    Location.lookupLocation({
    tableName: Location.tableName,
    search: request.body.city,
    cacheHit: function () {
        currentLocation = request.body.city;
        response.redirect('/menu');
    },
    cacheMiss: function () {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.city}&key=${process.env.GEOCODE_API_KEY}`;
      currentLocation = request.body.city;
      
      return superagent.get(url)
        .then(res => {
          const location = new Location(request.body.city, res);
          location.save()
            .then(getRestCountry(res.body.results[0].address_components[res.body.results[0] .address_components.length - 1].long_name))
            .then(response.redirect('/menu'));
        })
        .catch(error => handleError(error));    
    }
  })
}

//Country data handler
function getRestCountry (country) {
  const url = `https://restcountries.eu/rest/v2/name/${country}`;
  return superagent.get(url)
    .then (results => {
      const restCountry = new RestCountryObj(results.body);
      restCountry.save(country);
    })
}

// Google translator handler
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

//Currency converter handler
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
          response.render('pages/currencyResult', {resultShow : '$' + request.body.currencyReturn + ' is worth ' + currSymbol + ' ' + resultdec})
        })
        .catch(error => handleError(error, response));
    })
}

//Yelp results handler
function showYelpResults (req, res) {
  let SQL = 'SELECT latitude, longitude FROM locations WHERE city_name=$1;';
  let values = [currentLocation];

  client.query(SQL, values)
    .then( result => {
      const url = `https://api.yelp.com/v3/businesses/search?term=${req.body.yelpSearchInquiry}&latitude=${result.rows[0].latitude}&longitude=${result.rows[0].longitude}`;

      superagent.get(url)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(yelpResponse => {
          const yelpSummaries = yelpResponse.body.businesses.map(place => {
            return new YelpObj(place);
          });
          res.render('pages/yelpresults',{searchResults: yelpSummaries})
        })
        .catch(error => handleError(error, res));
    })
}

//Save yelp data to local database
function addYelptoSave (req, res) {
  let {name, created_at, rating, price, image_url, url} = req.body;

  let SQL = 'INSERT INTO yelp(name, created_at, rating, price, image_url, url) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [name, created_at, rating, price, image_url, url];
  return client.query(SQL, values)
    .then(res.redirect('/yelp'))
    .catch(handleError);
}

//Delete data from yelp table
function deleteYelp (req, res) {
  let SQL = 'DELETE FROM yelp WHERE id=$1;';
  let values = [req.params.yelp_id];

  return client.query(SQL, values)
    .then(res.redirect('/yelp'))
    .catch(handleError);
}

//Helper functions to render current page
function currencyPage(req, res) {
  res.render('./pages/currency');
}

//Helper functions to show AboutUs page
function showAboutUs (req, res) {
  res.render('./pages/aboutus');
}

// Clear the DB data for a location if it is stale
function deletebyLocation(table, city) {
  const SQL = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(SQL);
}

//Error handle function
function handleError(err, res) {
  console.error(err);
  if (res) res.satus(500).send('Error encountered.');
}




