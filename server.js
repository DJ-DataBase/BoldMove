'use strict';

// app dependencies
const express = require('express');
// const superagent = require('superagent');

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
