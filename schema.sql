DROP TABLE locations, forecasts, yelp;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255),
    country_name VARCHAR(255),
    latitude NUMERIC(8, 6),
    longitude NUMERIC (9, 6),
    currency_code VARCHAR(255),
    currency_symbol VARCHAR(255),
    lang_code VARCHAR(255),
    lang_name VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS forecasts ( 
    id SERIAL PRIMARY KEY,
    current_temp VARCHAR(255),
    current_summary VARCHAR(255),
    current_precip VARCHAR(255), 
    current_cloud_cover VARCHAR(255),
    current_visibility VARCHAR(255),
    current_humidity VARCHAR(255),
    current_wind_speed VARCHAR(255),
    tomorrow_high VARCHAR(255),
    tomorrow_low VARCHAR(255),
    tomorrow_summary VARCHAR(255),
    tomorrow_precip VARCHAR(255),
    tomorrow_cloud_cover VARCHAR(255),
    tomorrow_visibility VARCHAR(255),
    tomorrow_humidity VARCHAR(255),
    tomorrow_wind_speed VARCHAR(255),
    time VARCHAR(255),
    created_at BIGINT,
    location_id VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS yelp (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255), 
    created_at BIGINT,
    rating NUMERIC(3, 0),
    price VARCHAR(255),
    image_url VARCHAR(255),
    url VARCHAR(255)
  );
