"use strict";

const pool = require('./db').pool;
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

async function main() {
  let script = await readFile('reset.sql', 'utf8');
  let results = await pool.query(script);
  console.log('results', results);
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
