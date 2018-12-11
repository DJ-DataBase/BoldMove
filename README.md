# Project Name: BoldMove
#### Version 1.0.0
----------

## Team Members:
- Julie Ly
- Dev Shrestha
- Dan Ule
- Brent Woodward

## Descripition 
BoldMove combines a currency converter, weather forecast, yelp and a translater in one place for a traveller's convenience when travelling abroad. 

## Problem domain and solution
Understanding some of the core requirements that a tourist or a visitor would have when travelling to a new destination. We wanted a one stop show where users could get multiple information rather than needing multiple applications. We made use of differnt APIs to make this application work. 

## Instructions
The User does not need to download anything to use BoldMove. The user needs to input a foriegn location (city, country, or address) in the application. The user then gets multiple option to find the needed information. The user can choose the currency converter, language translator, weather information and/or Yelp search. 


## List of any libraries, frameworks
### Node packages 
- Express
- Superagent
- Cors
- PG
- Dotenv
- EJS
- Method-Override

### Libraries
- Jquery

## APIs: 
#### We used the following APIs to use HTTP requests to get information from multiple web servers. (See end of page for Sample responses from these API's) 
- Yelp
- Currency Layer
- Rest Country
- Dark Sky
- Google Location
- Google Translate

## Acknowledgement: 
- Used for image resizing: https://www.photoresizer.com/ 
- Images: https://pixabay.com/
- Used for hamburger: https://codepen.io/erikterwan/pen/EVzeRP

## Database schemas: 
Our SQL tables are: 
- locations
  - Information stored: city_name, country_name, latitude, longitude, currency_code, currency_symbol, lang_code, lang_name
- forecasts
  - Information stored: current_temp, current_summary, current_precip, current_cloud_cover, current_visibility, current_humidity, current_wind_speed, tomorrow_high, tomorrow_low, tomorrow_summary, tomorrow_precip, tomorrow_cloud_cover, tomorrow_visibility, tomorrow_humidity, tomorrow_wind_speed, time, created_at, location_id
- yelp
  - Information stored: name,  created_at, rating, price, image_url, url

## Sample responses from API's
### Google Location
{
    "results": [
        {
            "address_components": [
                {
                    "long_name": "Tokyo",
                    "short_name": "Tokyo",
                    "types": [
                        "administrative_area_level_1",
                        "locality",
                        "political"
                    ]
                },
                {
                    "long_name": "Japan",
                    "short_name": "JP",
                    "types": [
                        "country",
                        "political"
                    ]
                }
            ],
            "formatted_address": "Tokyo, Japan",
            "geometry": {
                "bounds": {
                    "northeast": {
                        "lat": 35.8986468,
                        "lng": 153.9876115
                    },
                    "southwest": {
                        "lat": 24.2242626,
                        "lng": 138.942758
                    }
                },
                "location": {
                    "lat": 35.6894875,
                    "lng": 139.6917064
                },
                "location_type": "APPROXIMATE",
                "viewport": {
                    "northeast": {
                        "lat": 35.817813,
                        "lng": 139.910202
                    },
                    "southwest": {
                        "lat": 35.528873,
                        "lng": 139.510574
                    }
                }
            },
            "place_id": "ChIJ51cu8IcbXWARiRtXIothAS4",
            "types": [
                "administrative_area_level_1",
                "locality",
                "political"
            ]
        }
    ],
    "status": "OK"
}

### Rest Country
[
    {
        "name": "France",
        "topLevelDomain": [
            ".fr"
        ],
        "alpha2Code": "FR",
        "alpha3Code": "FRA",
        "callingCodes": [
            "33"
        ],
        "capital": "Paris",
        "altSpellings": [
            "FR",
            "French Republic",
            "République française"
        ],
        "region": "Europe",
        "subregion": "Western Europe",
        "population": 66710000,
        "latlng": [
            46,
            2
        ],
        "demonym": "French",
        "area": 640679,
        "gini": 32.7,
        "timezones": [
            "UTC-10:00",
            "UTC-09:30",
            "UTC-09:00",
            "UTC-08:00",
            "UTC-04:00",
            "UTC-03:00",
            "UTC+01:00",
            "UTC+03:00",
            "UTC+04:00",
            "UTC+05:00",
            "UTC+11:00",
            "UTC+12:00"
        ],
        "borders": [
            "AND",
            "BEL",
            "DEU",
            "ITA",
            "LUX",
            "MCO",
            "ESP",
            "CHE"
        ],
        "nativeName": "France",
        "numericCode": "250",
        "currencies": [
            {
                "code": "EUR",
                "name": "Euro",
                "symbol": "€"
            }
        ],
        "languages": [
            {
                "iso639_1": "fr",
                "iso639_2": "fra",
                "name": "French",
                "nativeName": "français"
            }
        ],
        "translations": {
            "de": "Frankreich",
            "es": "Francia",
            "fr": "France",
            "ja": "フランス",
            "it": "Francia",
            "br": "França",
            "pt": "França",
            "nl": "Frankrijk",
            "hr": "Francuska",
            "fa": "فرانسه"
        },
        "flag": "https://restcountries.eu/data/fra.svg",
        "regionalBlocs": [
            {
                "acronym": "EU",
                "name": "European Union",
                "otherAcronyms": [],
                "otherNames": []
            }
        ],
        "cioc": "FRA"
    }
]

### Darksky
{
    "latitude": -51.51,
    "longitude": -0.13,
    "timezone": "Etc/GMT",
    "currently": {
        "time": 1544511593,
        "summary": "Overcast",
        "icon": "cloudy",
        "precipIntensity": 0.001,
        "precipProbability": 0.11,
        "precipType": "snow",
        "temperature": 33.9,
        "apparentTemperature": 21.4,
        "dewPoint": 29.6,
        "humidity": 0.84,
        "pressure": 983.01,
        "windSpeed": 24.23,
        "windGust": 31.01,
        "windBearing": 261,
        "cloudCover": 1,
        "uvIndex": 1,
        "visibility": 10,
        "ozone": 350.53
    },
    "hourly": {
        "summary": "Mostly cloudy throughout the day and windy starting this afternoon.",
        "icon": "wind",
        "data": [
            {
                "time": 1544508000,
                "summary": "Windy and Overcast",
                "icon": "wind",
                "precipIntensity": 0.0011,
                "precipProbability": 0.09,
                "precipAccumulation": 0.008,
                "precipType": "snow",
                "temperature": 33.62,
                "apparentTemperature": 20.56,
                "dewPoint": 29.28,
                "humidity": 0.84,
                "pressure": 982.81,
                "windSpeed": 26.35,
                "windGust": 32.82,
                "windBearing": 260,
                "cloudCover": 1,
                "uvIndex": 1,
                "visibility": 10,
                "ozone": 349.99
            }
### Yelp
"businesses": [
        {
            "id": "btzNQ-765GYkDUHaRyfyEw",
            "alias": "le-ruisseau-burger-joint-paris",
            "name": "Le Ruisseau - Burger Joint",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DbJjhyD81HzN7h03-EzFOQ/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/le-ruisseau-burger-joint-paris?adjust_creative=QailHQ2lZirdKKJTGc9X1Q&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=QailHQ2lZirdKKJTGc9X1Q",
            "review_count": 33,
            "categories": [
                {
                    "alias": "burgers",
                    "title": "Burgers"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 48.860994,
                "longitude": 2.354433
            },
            "transactions": [],
            "price": "€€",
            "location": {
                "address1": "22 rue Rambuteau",
                "address2": "",
                "address3": "",
                "city": "Paris",
                "zip_code": "75003",
                "country": "FR",
                "state": "75",
                "display_address": [
                    "22 rue Rambuteau",
                    "75003 Paris",
                    "France"
                ]
            },
            "phone": "+33143700221",
            "display_phone": "+33 1 43 70 02 21",
            "distance": 515.1761549021766
        }

### Currency
0.87998

### Google Translate
{
    "data": {
        "translations": [
            {
                "translatedText": "تشناب چېرته دی؟",
                "detectedSourceLanguage": "en"
            }
        ]
    }
}