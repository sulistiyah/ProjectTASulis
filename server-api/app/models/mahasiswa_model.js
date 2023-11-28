module.exports = (sequelizeDB, Sequelize) => {
    const User = sequelizeDB.define("user_mahasiswa", {
      nim: {
        type: Sequelize.STRING(30)
      },
      nama: {
        type: Sequelize.STRING(50)
      },
      noTelepon: {
        type: Sequelize.STRING(30)
      },
      password: {
        type: Sequelize.STRING(30)
      },
      rePassword: {
        type: Sequelize.STRING(30)
      },
      image: {
        type: Sequelize.STRING(100)
      },
      token: {
        type: Sequelize.STRING(100)
      }
    }, {
        tableName : "user_mahasiswa"
    })
  
    return User;
  };  