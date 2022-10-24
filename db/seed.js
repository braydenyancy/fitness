/* 
DO NOT CHANGE THIS FILE
*/
const client = require('./client');
const { rebuildDB } = require('./seedData');

console.log('STARTING DATABASE TEST')

rebuildDB()
  .catch(console.error)
  .finally(() => client.end());
