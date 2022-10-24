/* eslint-disable no-useless-catch */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const { getUserByUsername, createUser, getUserById, getPublicRoutinesByUser, getAllRoutinesByUser } = require("../db")
const { UserTakenError, PasswordTooShortError} = require('../errors')
const bcrypt = require('bcrypt')
const { JWT_SECRET } = process.env;
const { requireUser } = require('./utils')

// POST /api/users/register
router.post('/register', async (req, res, next) => {

    const { username, password } = req.body;

    try {

        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: UserTakenError(username),
                error: "error",
            });
        }

        if (password.length < 8) {
            res.send({
                name: "Password too short",
                message: PasswordTooShortError(),
                error: "error",
            })
        }

        const user = await createUser({
            username,
            password
        });
        console.log(user.id)
        console.log(user)
        console.log(username)
        const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
        res.send({
            message: "thank you for signing up",
            token,
            user,
        });

    } catch ({ name, message, error }) {
        next({ name, message, error })
    }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {

    const { username, password } = req.body;

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {

        const user = await getUserByUsername(username);

        const hashedPassword = user.password;
        const isValid = await bcrypt.compare(password, hashedPassword)

        if (user && isValid) {

            const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
            res.send({ message: "you're logged in!", user, token });

        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }

    } catch (error) {
        console.log(error);
        next(error);

    }

});

  
// GET /api/users/:username/routines
router.get('/:username/routines', requireUser, async (req, res, next) => {
    const user = await getUserByUsername(req.params.username)
    try {
        
        if(req.user.id === user.id){
            const allRoutines = await getAllRoutinesByUser(user)
            res.send(allRoutines)
        } 
        else {
            const routines = await getPublicRoutinesByUser(user)
            res.send(routines)
        }
    } catch(error){
        next(error)
    }
})
// GET /api/users/me
router.get("/me", requireUser, async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");
    try {
         if (auth.startsWith(prefix)) {
            const token = auth.slice(prefix.length)
            const { id } = jwt.verify(token, JWT_SECRET);
  
            if (id) {
                req.user = await getUserById(id);
                res.send(req.user);
            }
            
        } else {res.status(401)}
    }
    catch (error) {
        next(error);
        
    }
  });


module.exports = router;