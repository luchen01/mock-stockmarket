"use strict";

const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

const traders = {
  create: async function(name){
    //parameterized query
    return await pool.query(
      `INSERT INTO traders (name) VALUES ($1) RETURNING *`,
      [name]);
  }
}

const portfolio = {
  getAll: async function(){
    return await pool.query(
      `SELECT * FROM portfolio`
    );
  },
  create: async function(id){
    return await pool.query(
      `SELECT * FROM  portolios WHERE
      trader_id = $1`, [id]);
  }
}

const orders = {
  getAll: async function(){
    return await pool.query(
      `SELECT * FROM orders`)
  },
  create: async function(order){
    //parameterized query
    let matchingOrders;
    if(order.type === 'bid'){
      matchingOrders = await pool.query(
        `SELECT * FROM orders WHERE
          ticker = $1 AND type = 'ask' AND price <= $2
          AND fulfilled = 0 LIMIT 1`,
      [order.ticker, order.price]);
    } else {
      matchingOrders = await pool.query(
        `SELECT * FROM orders WHERE
          ticker = $1 AND type = 'bid' AND price >= $2 LIMIT 1`,
      [order.ticker, order.price]);
    }

    if(matchingOrders.rows.length){
      //found match!
      // console.log("matching orders", matchingOrders.rows);
      let matchingId = matchingOrders.rows[0].id;
      await pool.query(
        `UPDATE orders SET fulfilled = quantity WHERE id = $1`,
        [matchingId]);
      await pool.query(
        `INSERT INTO orders (trader_id, type, ticker, price, quantity, fulfilled)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [order.trader_id, order.type, order.ticker, order.price, order.quantity, order.quantity]);
      await pool.query(
        `INSERT INTO portfolio (trader_id, ticker, quantity)
          VALUES ($1, $2, $3)`,
          [order.trader_id, order.ticker, order.quantity]);
      await pool.query(
        `UPDATE portfolio SET quantity = 0 WHERE id = $1`,
        [matchingId]);
    } else {
      //no match
      return await pool.query(
        `INSERT INTO orders (trader_id, type,ticker, price, quantity)
          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [order.trader_id, order.type, order.ticker, order.price, order.quantity]);
    }
  }
}

module.exports = {
  traders,
  orders,
  portfolio,
  pool
};
