DROP TABLE IF EXISTS traders;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS orders;
DROP TYPE IF EXISTS bid_ask;

CREATE TYPE bid_ask AS ENUM ('bid', 'ask');

CREATE TABLE traders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  trader_id INTEGER REFERENCES traders NOT NULL,
  ticker TEXT NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  trader_id INTEGER REFERENCES traders NOT NULL,
  type bid_ask NOT NULL,
  ticker TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  fulfilled NUMERIC DEFAULT 0 NOT NULL
);
