const express = require('express')
const dotenv = require('dotenv')
// const path = require('path')
const cors = require('cors')
const middlewareLogRequest = require('../middleware/logs.js')
const bodyParser = require('body-parser')
const faceapi = require('face-api.js')
const { Canvas, Image } = require('canvas')
const canvas = require('canvas')
const fileUpload = require('express-fileupload')

faceapi.env.monkeyPatch({ Canvas, Image })

const app = express()
dotenv.config()

var corsOptions = {
    origin: "http//localhost:8081"
}

app.use(cors(corsOptions))
app.use(fileUpload({
    useTempFiles : true
}))
app.use(middlewareLogRequest)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : true}))

async function LoadFaceModels() {
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + '/models')
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + '/models')
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + '/models')
}

LoadFaceModels()


app.get("/", (req, res) => {
    res.json({
        message: "Welcome to PressTI Application"
    })
})

const db = require("../models")
db.sequelizeDatabase.sync()
    .then(() => {
        console.log("Synced Database")
    })
    .catch((err) => {
        console.log("Failed to sync Database: " + err.message)
    })

    //Pemanggilan masing-masing route
    require("../routes/admin_route.js")(app)
    require("../routes/program_studi_route")(app)
    require("../routes/kelas_route")(app)
    require("../routes/mata_kuliah_route.js")(app)
    require("../routes/auth_mahasiswa_route.js")(app)
    require("../routes/auth_dosen_route.js")(app)
    require("../routes/set_presensi_route.js")(app)
    require("../routes/face_route.js")(app)

    require("../routes/web.js")(app)


const PORT = process.env.NODE_DOCKER_PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is Running on port : ${PORT}`)
    // console.in
})