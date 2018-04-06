"use strict";

const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

const traders = {
  create: async function(name){
    //parameterized query
    return await pool.query(`INSERT INTO traders (name) VALUES ($1) RETURNING *`,[name]);
  }
}

const orders = {
  create: async function(order){
    //parameterized query
    let matchingOrders;
    if(order.type === 'bid'){
      matchingOrders = await pool.query(
        `SELECT * FROM order WHERE
          ticker = $1 AND type = 'ask' AND price <= $2
          AND fulfilled = 0 LIMIT 1`,
      [order.ticker, order.price]);
    } else {
      matchingOrders = await pool.query(
        `SELECT * FROM order WHERE
          ticker = $1 AND type = 'bid' AND price >= $2 LIMIT 1`,
      [order.ticker, order.price]);
    }

    if(matchingOrders.rows.length){
      //found match!
      let matchingId = matchingOrders.rows[0].id;
      await pool.query(
        `UPDATE orders SET fulfilled = quantity WHERE id = $1`,
        [matchingID]);
      return await pool.query(
        `INSERT INTO orders (trader_id, type,ticker, price, quantity, fulfilled)
          VALUE ($1, $2, $3, $4, $5)`,
        [order.trader_id, order.type, order.ticker, order.price, order.quantity]);
    } else {
      //no match
      return await pool.query(
        `INSERT INTO orders (trader_id, type,ticker, price, quantity)
          VALUE ($1, $2, $3, $4, $5)`,
        [order.trader_id, order.type, order.ticker, order.price, order.quantity]);
    }
  }
}

module.exports = {
  traders,
  orders,
  pool
};