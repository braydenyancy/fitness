/* eslint-disable no-useless-catch */
const express = require('express');
const { getRoutineActivityById, updateRoutineActivity, getRoutineById, destroyRoutineActivity } = require('../db');
const { requireUser } = require('./utils');
const { UnauthorizedUpdateError, UnauthorizedDeleteError } = require('../errors');
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch ( '/:routineActivityId', requireUser, async (req, res, next) => {
    
    const { routineActivityId } = req.params;
    const { duration, count } = req.body;
    const routineActivityData = {};

    try {
        
        const routineActivity = await getRoutineActivityById ( routineActivityId )
        const routine = await getRoutineById ( routineActivity.routineId )

        routineActivityData.duration = duration
        routineActivityData.count = count
        routineActivityData.id = routineActivity.id

        if ( routine.creatorId == req.user.id ) {
            
            const newRoutineActivity = await updateRoutineActivity (routineActivityData)
            res.send ( newRoutineActivity )
        } else {
            
            res.status(403);
            next({
                
                name: "Unauthorized Update",
                message: UnauthorizedUpdateError(req.user.username, routine.name),
                error: "error",
            })
        }
    } catch (error) {
        throw error
    } 
})


// DELETE /api/routine_activities/:routineActivityId
router.delete ( '/:routineActivityId', requireUser, async (req, res, next) => {
    
    const { routineActivityId } = req.params;

    try {
        
        const routineActivity = await getRoutineActivityById ( routineActivityId )
        const routine = await getRoutineById ( routineActivity.routineId )

        if ( routine.creatorId == req.user.id ) {
            
            const deletedRoutineActivity = await destroyRoutineActivity (routineActivityId);
            res.send ( deletedRoutineActivity )
        } else {
            
            res.status(403);
            next({
                
                name: "Unauthorized Delete",
                message: UnauthorizedDeleteError(req.user.username, routine.name),
                error: "error",
            })
        }
    } catch (error) {
        throw error
    } 
})


module.exports = router;