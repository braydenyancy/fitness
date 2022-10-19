/* eslint-disable no-useless-catch */
const client = require("./client")
const { ActivityNotFoundError } = require('../errors');

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
  } catch (error) {
    throw error
  }

} 

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT *
      FROM activities
      WHERE id=$1;
    `, [id]);

    if (!activity) {
      throw {
        error: "error",
        name: "ActivityNotFound",
        message: ActivityNotFoundError(id)
      };
    }

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name=$1;
    `, [name]);
    return activity;
  } catch (error) {
    throw error;
  }
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  try{
  const routinesCopy = [...routines]
  const routineIds = routines.map(routine => routine.id)
  const selectValues = routineIds.map(
    (_, index) => `$${index + 1}`).join(', ');
  const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON activities.id = routine_activities."activityId"
      WHERE routine_activities."routineId"
      IN (${selectValues});
    `, routineIds)
    // console.log(activities)
    routinesCopy.map(routine => {
      const filterActivities = activities.filter(activity => activity.routineId === routine.id)
      routine.activities =  filterActivities
    })
    return routinesCopy
  }catch (error) {
    throw error
  }
}

// return the new activity
async function createActivity({ name, description }) {
  try {
    const { rows: [activity] } = await client.query(`
        INSERT INTO activities (name, description) 
          VALUES($1, $2) 
          RETURNING *;
        `, [name, description,]);

    return activity;
  } catch (error) {
    throw error
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    if (setString.length > 0) {
      await client.query(`
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }

    return await getActivityById(id);
  } catch (error) {
    throw error;
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