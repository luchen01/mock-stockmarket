"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const morgan = require('morgan');
app.use(morgan('dev'));

const {traders, orders, reset} = require('./db');
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

app.use(async (req, res, next)=>{
  console.log("inside use");
  let results = await reset.create();
  console.log("results", results);
  return next()
})

app.post('/traders', async function(req, res, next){
  try{
    let result = await traders.create(req.body.name);
    res.json(results.rows[0])
  } catch (e) {
    next(e);
  }
})

app.post('/orders', async function(req, res, next){
  try{
    let result = await orders.create({
      trader_id: req.body.trader_id,
      type: req.body.type,
      ticker: req.body.ticker,
      price: req.body.price,
      quantity: req.body.quantity
    });
    res.json(results.rows[0])
  } catch (e) {
    next(e);
  }
})

app.use((err, req, res, next)=>{
  console.log('error', err);
  res.status(500).json({
    error: err.message
  })
})

app.listen(3000, ()=> {
  console.log('Started listening on 3000');
});

module.exports = app;
