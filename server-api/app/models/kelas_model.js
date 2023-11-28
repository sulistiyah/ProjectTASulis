module.exports = (sequelizeDB, Sequelize) => {
    const Kelas = sequelizeDB.define("kelas", {
        kodeKelas: {
            type: Sequelize.STRING(30)
        },
        kelas: {
            type: Sequelize.STRING(50)
        }
    }, {
        tableName : "kelas",
        timestamps : false,
        
    })

    return Kelas

}