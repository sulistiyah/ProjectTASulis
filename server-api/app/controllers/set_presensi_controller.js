const db = require("../models")
const SetPresensi = db.setPresensi
const ProgramStudi = db.programStudi
const Kelas = db.kelas
const MataKuliah = db.matkul
const Op = db.Sequelize.Op

exports.create = (req, res) => {
    //Menyimpan data Set Presensi kedalam database
    SetPresensi.create({
        programStudiId : req.body.programStudiId,
        kelasId : req.body.kelasId,
        mataKuliahId : req.body.mataKuliahId,
        tanggal : req.body.tanggal,
        jamMulai : req.body.jamMulai,
        jamBerakhir : req.body.jamBerakhir
    }, {
        include: [
            "programStudi",
            "kelas",
            "mataKuliah"
        ]
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
                            message: "Program Study not found"
                        });
                    } 
                })
                // Mencari kelas berdasarkan ID yang diberikan
                Kelas.findByPk(req.body.kelasId)
                .then(kelas => {
                    if (!kelas) {
                        res.status(404).send({
                            statusCode : 404,
                            message: "Class not found"
                        });
                    } else {
                        // Mencari Mata Kuliah berdasarkan ID yang diberikan
                        MataKuliah.findByPk(req.body.mataKuliahId)
                        .then(mataKuliah => {
                            if (!mataKuliah) {
                                res.status(404).send({
                                    statusCode : 404,
                                    message: "Kelas not found"
                                });
                            } else {
                                res.status(200).send({
                                    statusCode : 200,
                                    message: "Setting Presensi Successful",
                                    data: {
                                        id: data.id,
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
                                        mataKuliah: {
                                            id: mataKuliah.id,
                                            kodeMatkul : mataKuliah.kodeMatkul,
                                            mataKuliah : mataKuliah.mataKuliah
                                        },
                                        tanggal : data.tanggal,
                                        jamMulai : data.jamMulai,
                                        jamBerakhir : data.jamBerakhir   
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                statusCode : 500,
                                message: err.message || "Some error occurred while retrieving Mata Kuliah."
                            });
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        statusCode : 500,
                        message: err.message || "Some error occurred while retrieving kelas."
                    });
                });
        }
    })
    .catch(err => {
        res.status(500).send({
        statusCode : 500,
        message: err.message || "Some error occurred while creating the Set Presensi."
        });
    });
};

//Function GET => mendapatkan semua data dan mendapatkan data dengan query tertentu 
exports.findAll = (req, res) => {
    const setPresensi = req.query.setPresensi
    const condition = setPresensi? { setPresensi : { [Op.like]: `%${setPresensi}%` } } : null

    SetPresensi.findAll({ where : condition})
        .then(data => {
            res.status(200).send({
                statusCode : 200,
                message: "Success Get Data Set Presensi",
                data : data,
            })
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message:
                err.message || "Failed Get Data Set Presensi"
            })
        })
}

//Mendapatkan data Set Presensi dengan parameter id include data kelas 
exports.findOne = (req, res) => {
  const id = req.params.id;

  SetPresensi.findByPk(id, { include: ["programStudi", "kelas", "mataKuliah"] })
    .then(data => {
      if (data) {
        res.status(200).send({
          statusCode : 200,
          message: "Succes Get Data Set Presensi By Id",
          data : data,
        })
      } else {
        res.status(404).send({
          statusCode : 404,
          message: `Cannot find Set Presensi with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        statusCode : 500,
        message: "Error retrieving Set Presensi with id=" + id
      });
    });
};

//Update/Edit data Set Presensi dengan parameter id
exports.update = (req, res) => {
  SetPresensi.update(req.body, {
      where: { id: req.params.id }
  })
  .then(result => {
    if (result[0]) {
        SetPresensi.findByPk(req.params.id)
        .then(setPresensi => {
            const formattedData = {
                id: setPresensi.id,
                programStudi: {
                    id: setPresensi.programStudi.id,
                    kodeProdi: setPresensi.programStudi.kodeProdi,
                    programStudi: setPresensi.programStudi.programStudi
                },
                kelas: {
                    id: setPresensi.kelas.id,
                    kodeKelas: setPresensi.kelas.kodeKelas,
                    kelas: setPresensi.kelas.kelas
                },
                mataKuliah: {
                    id: setPresensi.mataKuliah.id,
                    kodeMatkul : setPresensi.mataKuliah.kodeMatkul,
                    mataKuliah : setPresensi.mataKuliah.mataKuliah
                },
                tanggal : setPresensi.tanggal,
                jamMulai : setPresensi.jamMulai,
                jamBerakhir : setPresensi.jamBerakhir   
            };

            res.status(200).send({
                statusCode : 200,
                message: "Set Presensi Update Successful",
                data: formattedData
            });
        })
        .catch(err => {
            res.status(500).send({
                statusCode : 500,
                message: err.message || "Some error occurred while retrieving the Set Presensi."
            });
        });
    } else {
        res.status(404).send({
            statusCode : 404,
            message: `Cannot update Set Presensi with id=${req.params.id}. Maybe Set Presensi was not found or req.body is empty!`
        });
    }
  })
  .catch(err => {
      res.status(500).send({
          statusCode : 500,
          message: err.message || "Some error occurred while updating the Set Presensi."
      });
  });
};

// Delete salah satu data Set Presensi dengan parameter id
exports.delete = (req, res) => {
  const id = req.params.id;

  SetPresensi.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.status(200).send({
          statusCode : 200,
          message: "Set Presensi was deleted successfully!"
        });
      } else {
        res.status(404).send({
          statusCode : 404,
          message: `Cannot delete Set Presensi with id=${id}. Maybe Set Presensi was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        statusCode : 500,
        message: "Could not delete Set Presensi with id=" + id
      });
    });
};

