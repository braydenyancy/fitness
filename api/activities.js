const express = require('express');
const router = express.Router();
const { getAllActivities, createActivity, getActivityById, getActivityByName, updateActivity, getPublicRoutinesByActivity } = require('../db');
const { ActivityExistsError, ActivityNotFoundError } = require('../errors');
const { requireUser } = require('./utils');

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
    
    const { activityId } = req.params

    try {
    
        const activity = await getActivityById(activityId)
    
        const actIdRoutines = await getPublicRoutinesByActivity(activity)

        if (actIdRoutines && actIdRoutines.length > 0) {
    
            res.send(actIdRoutines)
        }

    } catch (error) {
        res.send({
            error: "error",
            message: ActivityNotFoundError(activityId),
            name: "ActivityNotFoundError"
        })
    }
})
// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
      const activities = await getAllActivities();
      res.send(activities)
    } catch (error) {
      throw error;
    }
  });
// POST /api/activities
router.post('/', async (req, res, next) => {
    const { name, description } = req.body
    const activity = {}
   
    try {
        activity.id = req.user.id
        activity.name = name
        activity.description = description

        const createdActivity = await createActivity(activity)

        if (createdActivity){
        res.send(createdActivity);
        }
    } catch (error) {
        res.send({
            name: "ActivityExists",
            message: ActivityExistsError(name),
            error: "error"
        })
    }
})
// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req, res, next) =>{

    const { activityId } = req.params
    const { name, description } = req.body
    const updatedActivity = {}

    try{
        const activity = await getActivityById(activityId)

        if (!activity) {
            next(activity)
        }
        const duplicateActivity = await getActivityByName(name)
        console.log(duplicateActivity)
        if (duplicateActivity){
            res.send({
                name: "ActivityAlreadyExists",
                message: ActivityExistsError(name),
                error: "error"
            })
        }

        updatedActivity.name = name
        updatedActivity.description = description
        updatedActivity.id = req.params.activityId

        if (req.user) {
            const newActivity = await updateActivity(updatedActivity)
            res.send(newActivity)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;