/* eslint-disable no-useless-catch */
const client = require("./client")

// database functions
async function getAllActivities() {
  try {

    const { rows: activityID } = await client.query(`
    SELECT id
    FROM activities;
    `);

    const activities = await Promise.all(activityID.map(
      activity => getActivityById(activity.id)
    ));

    return activities;
  } catch(error){
    console.log(error)
  }
}

async function getActivityById(id) {

}

async function getActivityByName(name) {

}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
}

// return the new activity
async function createActivity({ name, description = ''
}) {
  try {
    const { rows: [activity] } = await client.query(`
        INSERT INTO activities(name, description) 
        VALUES($1, $2)
        ON CONFLICT (name) DO NOTHING 
        RETURNING *;
        `, [name, description]);

    return activity;
  } catch (error) {
    throw error;
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {

}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
