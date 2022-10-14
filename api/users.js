const express = require('express');
const usersRouter = express.Router();

// POST /api/users/login
usersRouter.post('/login', async(req, res, next) => {
    const { username, password } = req.body;

    if(!username || password)
    {
        next({
            name: "MissingCredentialsError",
            message: "Please enter both username AND password"
        });
    }

    try{
        const user = await function()

    } catch(error){
        console.log(error);
        next(error);
    }
});

// POST /api/users/register

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
