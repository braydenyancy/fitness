/* eslint-disable no-useless-catch */
const express = require('express');
const { getAllPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, addActivityToRoutine } = require('../db');
const { UnauthorizedUpdateError, UnauthorizedDeleteError, DuplicateRoutineActivityError } = require('../errors');
const { requireUser } = require('./utils');
const router = express.Router();

// GET /api/routines
router.get("/", async (req, res, next) => {
    try{
        const routines = await getAllPublicRoutines();
        res.send(routines)
    }catch(error){
        next(error)
    }
});

// POST /api/routines

router.post("/", requireUser, async (req, res, next) => {

    const { isPublic, name, goal } = req.body;
    const routine = {};

    try {
        routine.isPublic = isPublic;
        routine.name = name;
        routine.goal = goal;
        routine.creatorId = req.user.id;
        const newroutine = await createRoutine(routine);

        if (newroutine.creatorId == req.user.id) {
            delete newroutine.id;
            res.send(newroutine);
        }
        next({
            name: "UnauthorizedUserError",
            message: "You cannot update a post that is not yours",
        });
    } catch (error) {
        next (error)
    }
});



// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {

    const { routineId } = req.params;
    const { name, isPublic, goal } = req.body;
    const routine = {};

    try {
        const newRoutine = await getRoutineById(routineId);
        routine.isPublic = isPublic;
        routine.name = name;
        routine.goal = goal;
        routine.id = routineId

        if (newRoutine.creatorId == req.user.id) {
            const updatedRoutine = await updateRoutine(routine)
            res.send(updatedRoutine)
        } else {
            res.status(403);
            next({
                name: "UnauthorizedUpdate",
                message: UnauthorizedUpdateError(req.user.username, newRoutine.name),
                error: "error"
            })
        }
    }catch (error){
        next(error)
    }
})

// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
    const { routineId } = req.params;

    try {
        const routine = await getRoutineById(routineId);
        if (routine.creatorId == req.user.id){
            const deletedRoutine = await destroyRoutine(routineId);
            res.send(deletedRoutine[0])
        } else {
            res.status(403);
            next({
                name:"UnauthorizedDelete",
                message: UnauthorizedDeleteError(req.user.username, routine.name),
                error: "error"
            })
        }  
    }catch(error){
        next (error)
    }
})
// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", requireUser, async (req, res, next) => {
    const {routineId} = req.params
    const { activityId, count, duration } = req.body;

    const routineActivity = {}

    try {
        routineActivity.routineId = routineId;
        routineActivity.activityId = activityId;
        routineActivity.count = count;
        routineActivity.duration = duration

        const newRoutine = await addActivityToRoutine(routineActivity);

        if(newRoutine){
            res.send(newRoutine);
        }else {
            res.send({
                name: "DuplicateRoutineActivity",
                message: DuplicateRoutineActivityError(routineId, activityId),
                error: "error"
            });
        }
    } catch (error) {
        next (error)
    }
})

module.exports = router;