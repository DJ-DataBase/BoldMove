# BoldMove

## Contributors
* Julie Ly
* Dan Ule
* Dev Shrestha
* Brent Woodward

## Descripition 
You have packed up on made a change, now what? A traveller's app for surviving in a foriegn country! It helps users convert US dollar to local currency using curency converter API. This app also helps users find weather and general information of the town the user is inquiring about. 

## Problem domain and solution
Understanding some of the core requirements that a tourist or a visitor would have when travelling to a new destination. We wanted a one stop show where users could get multiple information rather than wonder into multiple applications. We made use of differnt APIs to make this application work. 

## Instructions
The user needs to input a location or city in the application. The user then gets multiple option to find the needed information. The user can choose currency converter, language translator, weather information and Yelp information. 


## List of any libraries, frameworks

# Node packages 
Express
Superagent
Cors
Pg
Dotenv

# APIs: We used the following APIs to use HTTP requests to get information from multiple web servers. We stored our API keys in .env file that was used in our application to pull information.   
Yelp
Currency Layer
Dark Sky
Google Location
Google Translate

## Dependencies
Acknowledgement: 
Used for image resizing
https://www.photoresizer.com/

# CSS:
https://codepen.io/erikterwan/pen/EVzeRP

Navigation Hamburger Menu
Erik Terwan

# Images: 
https://pixabay.com/


## Database schemas
We created the locations, forecasts, yelp tables in PosterSQL and stored the information in the local database. The data is first gets stored in locations table which also includes the country's language code and currency code. The yelp table stores information collected from the Yelp API. 