const db = require("../models")
const Kelas = db.kelas
const Op = db.Sequelize.Op

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


//Function menemukan semua data kelas dan menemukan data dengan query tertentu
exports.findAll = (req, res) => {
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
exports.findOne = (req, res) => {
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
exports.update = (req, res) => {
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
exports.delete = (req, res) => {
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

