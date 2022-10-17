/* eslint-disable no-useless-catch */
const { attachActivitiesToRoutines } = require('./activities');
const client = require('./client');

async function getRoutineById(id){

  try {
    const { rows: routine } = await client.query(`
    SELECY *
    FROM routes
    WHERE id=$1;
    `, [id]);

    if(!routine) {
      throw {
        name: "RoutineNotFoundError",
        message: "Could not find a routine with that routine"
      };
    }
    return routine;
  } catch(error){
    console.log("Error getting routine by id")
  }
}

async function getRoutinesWithoutActivities(){

  try {
    const { rows: routineIDs } = await client.query(`
    SELECT id
    FROM routines;
    `);

    const routines = await Promise.all(routineIDs.map(
      routine => getRoutineById(routine.id)
    ));
    return routines;
  } catch(error){
    console.log(error)
  }
}

async function getAllRoutines() {

  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users
    ON routines."creatorId"=users.id;
    `);

    const newRoutines = await attachActivitiesToRoutines(routines)

    return newRoutines;
  } catch(error){
    console.error("Error getting all routines")
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {

  try {

    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id=routines."creatorId"
      WHERE username=$1;
    `, [username]);
    const newRoutines = await attachActivitiesToRoutines(routines)

    return newRoutines;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users
    ON routines."creatorId"=users.id
    WHERE routines."isPublic" = true AND users.username = $1
    ;
    `,[username]);
    const activity = await attachActivitiesToRoutines(routine);

    return routine;
  } catch (error) {
    console.error("error getting all routines");
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users
    ON routines."creatorId"=users.id
    WHERE routines."isPublic" = true
    ;
    `);
    const activity = await attachActivitiesToRoutines(routine)
    
  
    return routine
    
  } catch (error) {
    console.error("error getting all routines")
    throw error
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routines."isPublic" = true
    AND routine_activities."activityId" = $1
    ;
    `, [id]);
    

    const activity = await attachActivitiesToRoutines(routine)
    console.log(routine)
    return routine ;
  } catch (error) {
    console.error("error getting all routines");
    throw error;
  }
}

async function createRoutine({
  creatorId,
  isPublic,
  name,
  goal
}) {
  try {
    const { rows: [routine] } = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {

  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {

    if (setString.length > 0) {

      await client.query(`
        UPDATE routines
        SET ${setString}
        WHERE id=${id}
        RETURNING *;`, Object.values(fields));
    }

    return await getRoutineById(id);
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {

  try {

    const { rows: [deletedRoutine_Activities] } = await client.query(`
      DELETE from routine_activities
      WHERE routine_activities."routineId"=$1
      RETURNING *;`, [id]);

    const { rows: [deletedRoutine] } = await client.query(`
      DELETE FROM routines
      WHERE id=$1
      RETURNING *;`, [id]);

    return deletedRoutine, deletedRoutine_Activities
  } catch (error) {
    throw error
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}