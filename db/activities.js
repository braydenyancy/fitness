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
    console.log("error getting all activities")
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activites
    WHERE id=$1;
    `, [id]);

    return activity;
  }catch(error){
    console.error("error getting activity by id")
    throw error
  }

}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name=$1;
    `, [name])
    return activity;
  }catch(error){
    console.error("error getting activity by name")
    throw error
  }
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
  const setString = Object.keys(fields)

  .map((key, index)=> `"${key}"=$${index + 1}`)

  .join(",")
  
  if (setString === 0){
    return
  }

  try {
    const {rows : [activity] } = await client.query(`
    UPDATE activities
    SET ${setString}
    WHERE id = ${id}
    RETURNING *
    `, Object.values(fields))

    return activity
  } catch (error) {
    console.error("Error updating the Activity")
    throw error
  }
}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
