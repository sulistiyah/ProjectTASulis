const db = require("../models")
const auth_config = require("../config/auth_config")
const UserDosen = db.userDosen
const Op = db.Sequelize.Op;
const  jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


//Proses Register Dosen
exports.register = (req, res) => {
    //Save User To Database
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const hashedRePassword = bcrypt.hashSync(req.body.rePassword, 8);
    UserDosen.create({
        nip : req.body.nip,
        nama : req.body.nama,
        email : req.body.email,
        noTelepon : req.body.noTelepon,
        password : hashedPassword,
        rePassword : hashedRePassword
        // password : bcrypt.hashSync(req.body.password, 8),
        // rePassword : bcrypt.hashSync(req.body.rePassword, 8 )
    })
    .then(data => {
        if (!req.body.nip || !req.body.nama || !req.body.email || !req.body.noTelepon || !req.body.password || !req.body.rePassword) {
            // console.log("Failed Register: Incomplete data provided");
            return res.status(400).send({
                statusCode : 400,
                message: "Incomplete data provided. Please fill in all required fields."
            });
        } else {
            // console.log("Received registration request:", req.body);
            // console.log("Registration Successful:", data);
            res.status(200).send({
                statusCode : 200,
                message: "Registration Successful",
                data: {
                    id: data.id,
                    nip: data.nip,
                    nama: data.nama,
                    email : data.email,                            
                    noTelepon: data.noTelepon,
                    password: data.password,
                    rePassword: data.rePassword
                }
            })
        }
    })
    .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: "Failed to register user. Please try again later.",
            error: err.message || "Some error occurred while creating the User."
        });
    });
}


//Proses Login Dossen
exports.login = (req, res) => {
    UserDosen.findOne({
        where : {
            nip : req.body.nip
        } 
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
                nip: data.nip,
                nama: data.nama,
                email: data.email,                    
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


//Proses Get Data Dosen - GET My Profile
exports.findAllMyProfile = (req, res) => {
    const nip = req.query.nip
    const condition = nip? { nip : { [Op.like]: `%${nip}%` } } : null

    UserDosen.findAll( { where : condition } )
        .then(data => {
            const formattedData = data.map(dosen => ({
                id: dosen.id,
                nip: dosen.nip,
                nama: dosen.nama,
                email: dosen.email,
                noTelepon: dosen.noTelepon,
                image: dosen.image
            }));
        
            res.status(200).send({
                statusCode : 200,
                message: "Succes Get Data Dosen",
                data: formattedData
            });
            
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message:
                err.message || "Failed Get Data Dosen"
            })
        })
}


//Proses GET Data Dosen - GET My Profile By Id
exports.findOneMyProfileById = (req, res) => {
    const id = req.params.id;
  
    UserDosen.findByPk( id )
      .then(data => {
        if (data) {
          res.status(200).send({
            statusCode : 200,
            message: "Succes Get Data Dosen By Id",
            data: {
                id: data.id,
                nip: data.nip,
                nama: data.nama,
                email: data.email,                   
                noTelepon: data.noTelepon,
                image: data.image
                
            }
          })
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot find Dosen with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
            statusCode : 500,
          message: "Error retrieving Dosen with id=" + id
        });
      });
};


//Proses Edit Profile - PUT data Edit Profil
exports.editProfil = (req, res) => {
    const id = req.params.id;

    UserDosen.update(req.body, {
        where: {
            id: id
        }
    })
    .then(() => {
        // Setelah update, dapatkan data terbaru dengan menggunakan findByPk
        return UserDosen.findByPk(id);
    })
    .then(updatedData => {
        if (!updatedData) {
            return res.status(404).send({
                statusCode : 404,
                message: `User with id=${id} not found after update.`
            });
        }

        res.status(200).send({
            statusCode : 200,
            message: "Update Profile Berhasil",
            data: {
                id: updatedData.id,
                nip: updatedData.nip,
                nama: updatedData.nama,
                email: updatedData.email,
                noTelepon: updatedData.noTelepon
            }
        });
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

    UserDosen.findByPk(id)
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
            UserDosen.update(
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
                statusCode : 500,
                message: err.message || "Some error occurred while retrieving the User."
            });
        });
};