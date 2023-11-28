module.exports = (sequelizeDB, Sequelize) => {
    const SetPresensi = sequelizeDB.define("set_presensi", {
      tanggal: {
        type: Sequelize.DATE
      },
      jamMulai: {
        type: Sequelize.TIME
      },
      jamBerakhir: {
        type: Sequelize.TIME
      }
    }, {
        tableName : "set_presensi"
    })
  
    return SetPresensi;
  };  