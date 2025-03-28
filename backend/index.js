const express = require('express')
const cors = require('cors')
const UserRouter = require('./router/UserRoutes')
const PetRouter = require('./router/PetRoutes')
const app = express()

//config JSON response 

app.use(express.json())

app.use(cors({credentials: true , origin: 'http://localhost:3000'}))

//public folder for images 

app.use(express.static('public'))

//Routes 
app.use('/users', UserRouter)
app.use('/pets', PetRouter)

app.listen(5000)