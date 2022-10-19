const express = require('express');
// const cors = require("cors");
const router = express.Router();
const { JWT_SECRET } = process.env
const jwt = require('jsonwebtoken')
const { getUserById } = require('../db')

// GET /api/health
router.get('/health', (req, res, next) => {
    try {
        let response = {message: 'all is well'}
        res.send(response)
  
    } catch (error) {
        console.error
        throw error
    }
    next()
});

router.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if(!auth) {
        next();
    } else if(auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length)
    
        try {
            const {id} = jwt.verify(token, JWT_SECRET)
            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({name, message}) {
            next({name, message})
        }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        })
    }
})

router.use((req, res, next) => {
    if (req.user){
        console.log('user is set:', req.user)
    }
    next()
})


// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);


router.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message,
        error: error.error
    })
})

router.use("/unknown", async(req ,res)=>{
    await res.status(404).send({
        message: 'Not a valid url'})
})

module.exports = router;