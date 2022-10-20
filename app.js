require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan')
const apiRouter = require('./api')

app.use(morgan('dev'))
app.use(express.json())
app.use('/api', apiRouter)

module.exports = app;