DROP TABLE locations;

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