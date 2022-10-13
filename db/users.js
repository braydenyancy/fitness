const client = require("./client");

// database functions

// user functions
async function createUser({
  username, 
  password
}) {
  const SALT_COUNT = 10;

  const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

  try {

    const { rows: [user] } = await client.query(`
    INSERT INTO users(username, password)
    VALUES($1, $2, $3)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
  `, [username, password]);
  
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {

  const user = await getUserByUserName(username);

  const hashedPassword = user.password;

  const isValid = await bcrypt.compare(password, hashedPassword)

}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
    SELECT id, username, name, active
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
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
