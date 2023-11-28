module.exports = (sequelizeDB, Sequelize) => {
    const Image = sequelizeDB.define("image", {
      type: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.BLOB("long"),
      },
    });
  
    return Image;
  };