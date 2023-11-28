module.exports = (sequelizeDB, Sequelize) => {
    const Face = sequelizeDB.define("face", {
      label: {
        type: Sequelize.STRING,
        required : true,
        unique : true
      },
      descriptions: {
        type: Sequelize.STRING,
        required : true
      }
    }, {
        tableName : "face"
    })
  
    return Face;
  };  