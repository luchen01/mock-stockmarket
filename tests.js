"use strict";

const chai = require('chai');
const {expect} = chai;

const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const db = require('db').pool;

async function resetSchema(){
  let script = await readFile('reset.sql', 'utf8');
  return await db.query(script);
}

describe ("this", ()=>{
  beforeEach(async function)
})
