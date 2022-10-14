/* eslint-disable no-useless-catch */
const client = require('./client');

async function getRoutineById(id){
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
}

async function getAllRoutinesByUser({username}) {
}

async function getPublicRoutinesByUser({username}) {
}

async function getAllPublicRoutines() {
}

async function getPublicRoutinesByActivity({id}) {
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

async function updateRoutine({id, ...fields}) {
}

async function destroyRoutine(id) {
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