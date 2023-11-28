const db = require("../models")
const auth_config = require("../config/auth_config")
const UserMahasiswa = db.userMahasiswa
const ProgramStudi = db.programStudi
const Kelas = db.kelas
const Op = db.Sequelize.Op;
const  jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


//Proses Register Mahasiswa
exports.register = (req, res) => {
    //Save User To Database
    UserMahasiswa.create({
        nim : req.body.nim,
        nama : req.body.nama,
        programStudiId : req.body.programStudiId,
        kelasId : req.body.kelasId,
        noTelepon : req.body.noTelepon,
        password : bcrypt.hashSync(req.body.password, 8),
        rePassword : bcrypt.hashSync(req.body.rePassword, 8 )
    }, { 
        include: ["programStudi", "kelas"] 
    })
    .then(data => {
        if (!data) {
            res.status(404).send({
                statusCode : 404,
                message: "Failed Register"
            });
        } else {
        // Mencari program studi berdasarkan ID yang diberikan
            ProgramStudi.findByPk(req.body.programStudiId)
                .then(programStudi => {
                if (!programStudi) {
                    res.status(404).send({
                        statusCode : 404,
                        message: "Program Studi not found"
                    });
                } else {
                    // Mencari kelas berdasarkan ID yang diberikan
                    Kelas.findByPk(req.body.kelasId)
                    .then(kelas => {
                        if (!kelas) {
                            res.status(404).send({
                                statusCode : 404,
                                message: "Kelas not found"
                            });
                        } else {
                            res.status(200).send({
                                statusCode : 200,
                                message: "Registration Successful",
                                data: {
                                    id: data.id,
                                    nim: data.nim,
                                    nama: data.nama,
                                    programStudi: {
                                        id: programStudi.id,
                                        kodeProdi: programStudi.kodeProdi,
                                        programStudi: programStudi.programStudi,
                                    },
                                    kelas: {
                                        id: kelas.id,
                                        kodeKelas: kelas.kodeKelas,
                                        kelas: kelas.kelas,
                                    },                                
                                    noTelepon: data.noTelepon,
                                    password: data.password,
                                    rePassword: data.rePassword,
                                    // image: data.image,
                                    // token: data.token
                                    
                                }
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                        statusCode : 500,
                        message: err.message || "Some error occurred while retrieving Kelas."
                        });
                    });
                }
                })
                .catch(err => {
                    res.status(500).send({
                        statusCode : 500,
                        message: err.message || "Some error occurred while retrieving Program Studi."
                    });
                });
        }
    })
    .catch(err => {
        res.status(500).send({
        statusCode : 500,
        message: err.message || "Some error occurred while creating the User."
        });
    });
}


//Proses Login Mahasiswa
exports.login = (req, res) => {
    UserMahasiswa.findOne({
        where : {
            nim : req.body.nim
        },
        include : [
            {
                model : ProgramStudi,
                as: "programStudi"
            },
            {
                model : Kelas,
                as : "kelas"
            }            
        ]    
    })
    .then(data => {
        if(!data) {
            return res.status(404).send({
                statusCode : 404,
                message : "User Not Found."
            })
        } 

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            data.password
        )

        if(!passwordIsValid) {
            return res.status(401).send({
                statusCode : 401,
                accessToken : null,
                message: "Invalid Password"
            })
        }

        const token = jwt.sign(
            { id: data.id },
            auth_config.secret,
            {
              algorithm: 'HS256',
              allowInsecureKeySizes: true,
              expiresIn: 86400, // 24 hours
            }
        );

        res.status(200).send({
            statusCode : 200,
            message: "Login Successful",
            data: {
                id: data.id,
                nim: data.nim,
                nama: data.nama,
                programStudi: {
                    id : data.programStudi.id,
                    kodeProdi : data.programStudi.kodeProdi,
                    programStudi : data.programStudi.programStudi
                },
                kelas: {
                    id : data.kelas.id,
                    kodeKelas : data.kelas.kodeKelas,
                    kelas : data.kelas.kelas
                },                          
                noTelepon: data.noTelepon,
                accessToken : token
                
            }
        });       
    })
    .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: err.message || "Some error occurred while login the User."
        });
    });
}


//Proses Get Data Mahasiswa - GET My Profile
exports.findAllMyProfile = (req, res) => {
    const nim = req.query.nim
    const condition = nim? { nim : { [Op.like]: `%${nim}%` } } : null

    UserMahasiswa.findAll({
        where : condition,
        include : [
            {
                model : ProgramStudi,
                as: "programStudi"
            },
            {
                model : Kelas,
                as : "kelas"
            }]    
        })
        .then(data => {
            const formattedData = data.map(mahasiswa => ({
                id: mahasiswa.id,
                nim: mahasiswa.nim,
                nama: mahasiswa.nama,
                programStudi: {
                    id: mahasiswa.programStudi.id,
                    kodeProdi: mahasiswa.programStudi.kodeProdi,
                    programStudi: mahasiswa.programStudi.programStudi
                },
                kelas: {
                    id: mahasiswa.kelas.id,
                    kodeKelas: mahasiswa.kelas.kodeKelas,
                    kelas: mahasiswa.kelas.kelas
                },
                noTelepon: mahasiswa.noTelepon,
                image: mahasiswa.image
            }));
        
            res.status(200).send({
                statusCode : 200,
                message: "Succes Get Data Mahasiswa",
                data: formattedData
            });
            
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message:
                err.message || "Failed Get Data Mahasiswa"
            })
        })
}


//Proses GET Data Mahasiswa - GET My Profile By Id
exports.findOneMyProfileById = (req, res) => {
    const id = req.params.id;
  
    UserMahasiswa.findByPk(id, { include: ["programStudi", "kelas"] })
      .then(data => {
        if (data) {
          res.status(200).send({
            statusCode : 200,
            message: "Succes Get My Profile By Id",
            data: {
                id: data.id,
                nim: data.nim,
                nama: data.nama,
                programStudi: {
                    id : data.programStudi.id,
                    kodeProdi : data.programStudi.kodeProdi,
                    programStudi : data.programStudi.programStudi
                },
                kelas: {
                    id : data.kelas.id,
                    kodeKelas : data.kelas.kodeKelas,
                    kelas : data.kelas.kelas
                },                          
                noTelepon: data.noTelepon,
                image: data.image
                
            }
          })
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot find My Profile with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: "Error retrieving My Profile with id=" + id
        });
      });
};


//Proses Edit Profile - PUT data Edit Profil
exports.editProfil = (req, res) => {
    UserMahasiswa.update(req.body, {
        where: {
            id: req.params.id
        }
    })
    .then(result => {
        if (result[0]) {
            UserMahasiswa.findByPk(req.params.id, {
                include: [
                    {
                        model: ProgramStudi,
                        as: "programStudi"
                    },
                    {
                        model: Kelas,
                        as: "kelas"
                    }
                ]
            })
            .then(mahasiswa => {
                const formattedData = {
                    id: mahasiswa.id,
                    nim: mahasiswa.nim,
                    nama: mahasiswa.nama,
                    programStudi: {
                        id: mahasiswa.programStudi.id,
                        kodeProdi: mahasiswa.programStudi.kodeProdi,
                        programStudi: mahasiswa.programStudi.programStudi
                    },
                    kelas: {
                        id: mahasiswa.kelas.id,
                        kodeKelas: mahasiswa.kelas.kodeKelas,
                        kelas: mahasiswa.kelas.kelas
                    },
                    noTelepon: mahasiswa.noTelepon
                };

                res.status(200).send({
                    statusCode : 200,
                    message: "Profile Update Successful",
                    data: formattedData
                });
            })
            .catch(err => {
                res.status(500).send({
                    statusCode : 500,
                    message: err.message || "Some error occurred while retrieving the User."
                });
            });
        } else {
            res.status(404).send({
                statusCode : 404,
                message: `Cannot update profile with id=${req.params.id}. Maybe profile was not found or req.body is empty!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: err.message || "Some error occurred while updating the User."
        });
    });
}


//Proses Penggantian Password - PUT data Edit Profil
exports.changePassword = (req, res) => {
    const id = req.params.id;
    const { password, newPassword, confirmPassword } = req.body;

    // Validasi bahwa newPassword dan confirmPassword sama
    if (newPassword !== confirmPassword) {
        return res.status(400).send({
            statusCode : 400,
            message: "New password and confirm password do not match."
        });
    }

    UserMahasiswa.findByPk(id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    statusCode : 404,
                    message: `User with id=${id} not found.`
                });
            }

            // Validasi bahwa password lama sesuai
            const passwordIsValid = bcrypt.compareSync(password, data.password);
            if (!passwordIsValid) {
                return res.status(401).send({
                    statusCode : 401,
                    message: "Invalid current password."
                });
            }

            // Enkripsi newPassword
            const hashedNewPassword = bcrypt.hashSync(newPassword, 8);

            // Update password baru ke dalam database
            UserMahasiswa.update(
                {   password: hashedNewPassword,
                    rePassword : hashedNewPassword },
                {   where: { id: id } }
            )
            .then(() => {
                res.status(200).send({
                    statusCode : 200,
                    message: "Password updated successfully."
                });
            })
            .catch(err => {
                res.status(500).send({
                    statusCode : 500,
                    message: err.message || "Some error occurred while updating the password."
                });
            });
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 400,
                message: err.message || "Some error occurred while retrieving the User."
            });
        });
};