const db = require("../models")
const Admin = db.admin
const ProgramStudi = db.programStudi
const Kelas = db.kelas
const MataKuliah = db.matkul
const UserMahasiswa = db.userMahasiswa
const UserDosen =  db.UserDosen
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs")

//====================================================================ADMIN============================================================

//Create akun admin
exports.createAdmin = (req, res) => {
  // Validate request
  // if (!req.body.admin) {
  //   res.status(400).send({
  //     statusCode : 400,
  //     message: "Content can not be empty!"
  //   });
  //   return;
  // }

  //membuat data program studi
  const admin = {
    nama: req.body.nama,
    email: req.body.email,
    noTelepon: req.body.noTelepon,
    password: bcrypt.hashSync(req.body.password, 8)

  };

  //Menyimpan data Program studi kedalam database
  Admin.create(admin)
    .then(data => {
      res.status(200).send({
        statusCode : 200,
        message : "Success Create Data Program Study",
        data : data
      });
    })
    .catch(err => {
      console.error("Error creating admin:", err);
      res.status(404).send({
        statusCode : 404,
        message: "Failed Get Data Program Study"
      });
    });
};


//Proses Login Mahasiswa
exports.loginAdmin = (req, res) => {
  Admin.findOne({
      where : {
          email : req.body.email
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

      res.status(200).send({
          statusCode : 200,
          message: "Login Successful"
      });       
  })
  .catch(err => {
      res.status(500).send({
          statusCode : 500,
          message: err.message || "Some error occurred while login the User."
      });
  });
}


//=================================================PROGRAM STUDI======================================================//

exports.createProgramStudi = (req, res) => {
  // Validate request
  if (!req.body.program_studi) {
    res.status(400).send({
      statusCode : 400,
      message: "Content can not be empty!"
    });
    return;
  }

  //membuat data program studi
  const program_studi = {
    kodeProdi: req.body.kodeProdi,
    programStudi: req.body.programStudi
  };

  //Menyimpan data Program studi kedalam database
  ProgramStudi.create(program_studi)
    .then(data => {
      res.status(200).send({
        statusCode : 200,
        message : "Success Create Data Program Study",
        data : data
      });
    })
    .catch(err => {
      res.status(404).send({
        statusCode : 404,
        message: "Failed Get Data Program Study"
      });
    });
};

//Function GET => mendapatkan semua data dan mendapatkan data dengan query tertentu 
exports.findAllProgramStudi = (req, res) => {
    const programStudi = req.query.programStudi
    const condition = programStudi? { programStudi : { [Op.like]: `%${programStudi}%` } } : null

    ProgramStudi.findAll({ where : condition})
        .then(data => {
            res.status(200).send({
                statusCode : 200,
                message: "Succes Get Data Program Study",
                data : data,
            })
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message:
                err.message || "Failed Get Data Program Study"
            })
        })
}

//Mendapatkan data program studi dengan parameter id include data kelas 
exports.findOneProgramStudi = (req, res) => {
  const id = req.params.id;

  ProgramStudi.findByPk(id, { include: ["kelas"] })
    .then(data => {
      if (data) {
        res.status(200).send({
          statusCode : 200,
          message: "Succes Get Data Program Study By Id",
          data : data,
        })
      } else {
        res.status(404).send({
          statusCode : 404,
          message: `Cannot find Program Study with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        statusCode : 500,
        message: "Error retrieving Program Study with id=" + id
      });
    });
};

//Update/Edit data program studi dengan parameter id
exports.updateProgramStudi = (req, res) => {
  ProgramStudi.update(req.body, {
      where: { id: req.params.id }
  })
  .then(result => {
    if (result[0]) {
      ProgramStudi.findByPk(req.params.id)
        .then(prodi => {
            const formattedData = {
                id: prodi.id,
                kodeProdi: prodi.kodeProdi,
                programStudi: prodi.programStudi,
            };

            res.status(200).send({
                statusCode : 200,
                message: "Program Study Update Successful",
                data: formattedData
            });
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message: err.message || "Some error occurred while retrieving the Program Study."
            });
        });
    } else {
        res.status(404).send({
            statusCode : 404,
            message: `Cannot update Program Study with id=${req.params.id}. Maybe Program Study was not found or req.body is empty!`
        });
    }
  })
  .catch(err => {
      res.status(500).send({
          statusCode : 500,
          message: err.message || "Some error occurred while updating the Program Study."
      });
  });
};

// Delete salah satu data program studi dengan parameter id
exports.deleteProgramStudi = (req, res) => {
  const id = req.params.id;

  ProgramStudi.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.status(200).send({
          statusCode : 200,
          message: "Program Study was deleted successfully!"
        });
      } else {
        res.status(404).send({
          statusCode : 404,
          message: `Cannot delete Program Study with id=${id}. Maybe Program Study was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        statusCode : 500,
        message: "Could not delete Program Study with id=" + id
      });
    });
};

//================================================================KELAS==================================================//
//membuatd dan menyimpan data kelas ke database
exports.createKelas = (req, res) => {
    // Validate request
    if (!req.body.kelas) {
      res.status(400).send({
        statusCode : 400,
        message: "Content can not be empty!"
      });
      return;
    }
  
    //membuat data kelas
    const kelas = {
      kodeKelas: req.body.kodeKelas,
      kelas: req.body.kelas
    };
  
    //menyimpan data kelas kedalam database
    Kelas.create(kelas)
      .then(data => {
        res.status(200).send({
          statusCode : 200,
          message : "Success Create Data Class",
          data : data
        });
      })
      .catch(err => {
        res.status(500).send({
        statusCode : 500,
        message:
           err.message || "Some error occurred while creating the Class."
        });
      });
  };
  
  
  //Function menemukan semua data kelas dan menemukan data dengan query tertentu
  exports.findAllKelas = (req, res) => {
    const kelas = req.query.kelas
    const condition = kelas? { kelas : { [Op.like]: `%${kelas}%` } } : null
  
    Kelas.findAll({ where : condition})
    .then(data => {
      res.status(200).send({
          statusCode : 200,
          message: "Succes Get Data Class",
          data : data,
      })
    })
    .catch(err => {
      res.status(500).send({
          statusCode : 500,
          message:
          err.message || "Failed Get Data Class"
      })
    })
  }
  
  //function mendapatkan data kelas berdasarkan parameter id include data program studi
  exports.findOneKelas = (req, res) => {
    const id = req.params.id;
  
    Kelas.findByPk(id, { include: ["programStudi"] })
      .then(data => {
        if (data) {
          res.status(200).send({
            statusCode : 200,
            message: "Succes Get Data Class By Id",
            data : data,
          })
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot find Class with id=${programStudiId}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          statusCode : 500,
          message: "Error retrieving Class with id=" + programStudiId
        });
      });
  };
  
  //Update/Edit data kelas berdasarkan parameter id
  exports.updateKelas = (req, res) => {
    Kelas.update(req.body, {
        where: { id: req.params.id }
    })
    .then(result => {
      if (result[0]) {
        Kelas.findByPk(req.params.id)
          .then(kelas => {
              const formattedData = {
                  id: kelas.id,
                  kodeKelas: kelas.kodeKelas,
                  kelas: kelas.kelas,
              };
  
              res.status(200).send({
                  statusCode : 200,
                  message: "Class Update Successful",
                  data: formattedData
              });
          })
          .catch(err => {
              res.status(500).send({
                  statusCode : 500,
                  message: err.message || "Some error occurred while retrieving the Class."
              });
          });
      } else {
          res.status(404).send({
              statusCode : 404,
              message: `Cannot update class with id=${req.params.id}. Maybe class was not found or req.body is empty!`
          });
      }
    })
    .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: err.message || "Some error occurred while updating the Class."
        });
    });
  };
  
  
  // Delete salah satu data kelas dengan parameter id
  exports.deleteKelas = (req, res) => {
    const id = req.params.id;
  
    Kelas.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.status(200).send({
            statusCode : 200,
            message: "Class was deleted successfully!"
          });
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot delete Class with id=${id}. Maybe Class was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          statusCode : 500,
          message: "Could not delete Class with id=" + id
        });
      });
  };

  
//=================================================================MATA KULIAH ==========================================================//

  exports.createMataKuliah = (req, res) => {
    // Validate request
    if (!req.body.mata_kuliah) {
      res.status(400).send({
        statusCode : 400,
        message: "Content can not be empty!"
      });
      return;
    }
  
    //membuat data Mata Kuliah
    const mata_kuliah = {
      kodeMatkul: req.body.kodeMatkul,
      mataKuliah: req.body.mataKuliah
    };
  
    //Menyimpan data Mata Kuliah kedalam database
    MataKuliah.create(mata_kuliah)
      .then(data => {
        res.status(200).send({
          statusCode : 200,
          message : "Success Create Data Mata Kuliah",
          data : data
        });
      })
      .catch(err => {
        res.status(404).send({
          statusCode : 404,
          message: "Failed Get Data Mata Kuliah"
        });
      });
  };
  
  //Function GET => mendapatkan semua data dan mendapatkan data dengan query tertentu 
  exports.findAllMataKuliah = (req, res) => {
      const mataKuliah = req.query.mataKuliah
      const condition = mataKuliah? { mataKuliah : { [Op.like]: `%${mataKuliah}%` } } : null
  
      MataKuliah.findAll({ where : condition})
          .then(data => {
              res.status(200).send({
                  statusCode : 200,
                  message: "Succes Get Data Mata Kuliah",
                  data : data,
              })
          })
          .catch(err => {
              res.status(500).send({
                  statusCode : 500,
                  message:
                  err.message || "Failed Get Data Mata Kuliah"
              })
          })
  }
  
  //Mendapatkan data Mata Kuliah dengan parameter id include data kelas 
  exports.findOneMataKuliah = (req, res) => {
    const id = req.params.id;
  
    MataKuliah.findByPk(id, { include: ["programStudi", "kelas"] })
      .then(data => {
        if (data) {
          res.status(200).send({
            statusCode : 200,
            message: "Succes Get Data Mata Kuliah By Id",
            data : data,
          })
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot find Mata Kuliah with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          statusCode : 500,
          message: "Error retrieving Mata Kuliah with id=" + id
        });
      });
  };
  
  //Update/Edit data Mata Kuliah dengan parameter id
  exports.updateMataKuliah = (req, res) => {
    MataKuliah.update(req.body, {
        where: { id: req.params.id }
    })
    .then(result => {
      if (result[0]) {
        MataKuliah.findByPk(req.params.id)
          .then(matkul => {
              const formattedData = {
                  id: matkul.id,
                  kodeMatkul: matkul.kodeMatkul,
                  mataKuliah: matkul.mataKuliah,
              };
  
              res.status(200).send({
                  statusCode : 200,
                  message: "Mata Kuliah Update Successful",
                  data: formattedData
              });
          })
          .catch(err => {
              res.status(500).send({
                  statusCode : 500,
                  message: err.message || "Some error occurred while retrieving the Mata Kuliah."
              });
          });
      } else {
          res.status(404).send({
              statusCode : 404,
              message: `Cannot update Mata Kuliah with id=${req.params.id}. Maybe Mata Kuliah was not found or req.body is empty!`
          });
      }
    })
    .catch(err => {
        res.status(500).send({
            statusCode : 500,
            message: err.message || "Some error occurred while updating the Mata Kuliah."
        });
    });
  };
  
  // Delete salah satu data Mata Kuliah dengan parameter id
  exports.deleteMataKuliah = (req, res) => {
    const id = req.params.id;
  
    MataKuliah.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.status(200).send({
            statusCode : 200,
            message: "Mata Kuliah was deleted successfully!"
          });
        } else {
          res.status(404).send({
            statusCode : 404,
            message: `Cannot delete Mata Kuliah with id=${id}. Maybe Mata Kuliah was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          statusCode : 500,
          message: "Could not delete Mata Kuliah with id=" + id
        });
      });
  };
  
//=======================================================USER MAHASISWA===============================================================
  