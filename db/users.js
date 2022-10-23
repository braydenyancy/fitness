/* eslint-disable no-useless-catch */
const client = require("./client");
const bcrypt = require("bcrypt");
const e = require("cors");

// database functions

// user functions
async function createUser({ username, password}) {

  try {

    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username`, [username, hashedPassword]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  
  try {
    const user = await getUserByUserName(username);
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword)
    
    if(isValid) {
      delete user.password;
      return user;
    }

    else return;  
  } catch(error){
    throw error;
    console.log(error)
  }

}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
    SELECT username
    FROM users
    WHERE id=${userId}
  `);
  } catch (error) {
    console.log(error)
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    console.error("error getting user")
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
