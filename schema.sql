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