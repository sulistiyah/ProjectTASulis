module.exports = (sequelizeDB, Sequelize) => {
    const ProgramStudi = sequelizeDB.define("program_studi", {
        kodeProdi: {
            type: Sequelize.STRING(30)
        },
        programStudi: {
            type: Sequelize.STRING(50)
        }
        
    }, {
        timestamps : false, // Nonaktifkan timestamping
        tableName : "program_studi"
    })

    return ProgramStudi



}
