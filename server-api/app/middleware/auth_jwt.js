const jwt = require("jsonwebtoken")
const configJwt = require("../config/auth_config.js")
// const db = require("../models/index.js")
// const UserMahasiswa = db.userMahasiswa


verifikasiToken = (req, res, next) => {
    let token = req.headers["x-access-token"]

    if(!token) {
        return res.status(403).send({
            message: "Not token provided!"
        })
    }

    jwt.verify(token, configJwt.secret, (err) => {
        if(err) {
            return res. status(401).send({
                message: "Unathorized!"
            })
        }
        // req.userMahasiswaId = decoded.id
        next()
    })

}


const authJwt = {
    verifikasiToken: verifikasiToken,
}

module.exports = authJwt
