module.exports = (sequelizeDB, Sequelize) => {
    const Admin = sequelizeDB.define("admin", {
      nama: {
        type: Sequelize.STRING(50)
      },
      email: {
        type: Sequelize.STRING(30)
      },
      noTelepon: {
        type: Sequelize.STRING(30)
      },
      password: {
        type: Sequelize.STRING(100)
      },
      
    }, {
        tableName : "admin"
    })
  
    return Admin;
};  