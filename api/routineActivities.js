const express = require('express');
const { getRoutineActivityById, updateRoutineActivity, getRoutineById, destroyRoutineActivity } = require('../db');
const { UnauthorizedUpdateError, UnauthorizedDeleteError } = require('../errors');
const { requireUser } = require('./utils');
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', requireUser, async (req, res, next)=>{
 const { routineActivityId } = req.params;
  const { duration, count } = req.body;

  const data = {};
  try {
    const routId = await getRoutineActivityById(routineActivityId);
    const name = await getRoutineById(routId.routineId)

    data.duration = duration;
    data.count = count;
    data.id = routId.id;
    
    if (name.creatorId == req.user.id) {
      const updatedActivity = await updateRoutineActivity(data);
      res.send(updatedActivity);
    } else if (routId.creatorId != req.user.id) {
      res.status(403);
      next({
        name: "UnathorizedActivityError",
        message: UnauthorizedUpdateError(req.user.username, name.name),
        error: "error",
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;
 
  try {
    const routId = await getRoutineActivityById(routineActivityId);
    const name = await getRoutineById(routId.routineId);

    if (name.creatorId == req.user.id) {
      const updatedActivity = await destroyRoutineActivity(routineActivityId);
      res.send(updatedActivity);
    } else if (routId.creatorId != req.user.id) {
      res.status(403);
      next({
        name: "UnathorizedActivityError",
        message: UnauthorizedDeleteError(req.user.username, name.name),
        error: "error",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;