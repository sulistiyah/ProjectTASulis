const db = require("../models")
const ProgramStudi = db.programStudi
const Kelas = db.kelas
const Op = db.Sequelize.Op

exports.create = (req, res) => {
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
exports.findAll = (req, res) => {
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
exports.findOne = (req, res) => {
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
exports.update = (req, res) => {
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
exports.delete = (req, res) => {
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

//membuatd dan menyimpan data kelas ke database
exports.create = (req, res) => {
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
