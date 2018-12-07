DROP TABLE locations, forecasts, yelp;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255),
    country_name VARCHAR(255),
    latitude NUMERIC(8, 6),
    longitude NUMERIC (9, 6),
    currency_code VARCHAR(255),
    currency_symbol VARCHAR(255),
    lang_code VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS forecasts ( 
    id SERIAL PRIMARY KEY,
    current_temp VARCHAR(255),
    current_precip VARCHAR(255), 
    current_summary VARCHAR(255),
    tomorrow_high VARCHAR(255),
    tomorrow_low VARCHAR(255),
    tomorrow_precip VARCHAR(255),
    time VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS yelp (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255), 
    created_at BIGINT,
    rating NUMERIC(3, 0),
    price VARCHAR(255),
    image_url VARCHAR(255)
  );

INSERT INTO locations (city_name, country_name, latitude, longitude, currency_code, currency_symbol, lang_code) 
VALUES('paris', 'France', 48.8566, 2.3522, 'EUR', '€', 'fr');

INSERT INTO yelp (name, created_at, rating, price, image_url) 
VALUES('fake result', 1544208724559, 2, '$', 'https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg');