const db = require("../models")
const UserMahasiswa = db.userMahasiswa
const UserDosen = db.userDosen

checkDuplicateDataMahasiswa = (req, res, next) => {
    //NIM
    UserMahasiswa.findOne({
        where: {
            nim : req.body.nim
        }
    }).then(data => {
        if(data) {
            res.status(400).send({
                message: "Failed! NIM is already in use"
            })
            return
        }

        //Nama
        UserMahasiswa.findOne({
            where: {
                nama : req.body.nama
            }
        }).then(data => {
            if(data) {
                res.status(400).send({
                    message: "Failed! Nama is already in use"
                })
                return
            }

            next()
        })
    })
}

checkDuplicateDataDosen = (req, res, next) => {
    //NIP
    UserDosen.findOne({
        where: {
            nip : req.body.nip
        }
    }).then(data => {
        if(data) {
            res.status(400).send({
                message: "Failed! NIP is already in use"
            })
            return
        }

        next()

        // //Nama
        // UserDosen.findOne({
        //     where: {
        //         nama : req.body.nama
        //     }
        // }).then(data => {
        //     if(data) {
        //         res.status(400).send({
        //             message: "Failed! Nama is already in use"
        //         })
        //         return
        //     }

        //     next()
        // })
    })
}

const verifikasiRegister = {
    checkDuplicateDataMahasiswa : checkDuplicateDataMahasiswa,
    checkDuplicateDataDosen : checkDuplicateDataDosen
}

module.exports = verifikasiRegister




