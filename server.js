'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// load environment variables from .env files
require ('dotenv').config();

// app setup
const PORT = process.env.PORT;
const app = express();

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// set view
app.set('view engine', 'ejs')

//database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

function handleError(err, res) {
  console.error(err);
  res.render('pages/error', {error: err});
}

//view routes
//just the test for proof of life
app.get('/', (request, response) => {
  response.render('pages/index');
})

//api routes

//catchall
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Helper Functions


//constructors/models