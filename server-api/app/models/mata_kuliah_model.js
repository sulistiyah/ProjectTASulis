module.exports = (sequelizeDB, Sequelize) => {
    const MataKuliah = sequelizeDB.define("mata_kuliah", {
        kodeMatkul: {
            type: Sequelize.STRING(30)
        },
        mataKuliah: {
            type: Sequelize.STRING(50)
        }
        
    }, {
        timestamps : false, // Nonaktifkan timestamping
        tableName : "mata_kuliah"
    })

    return MataKuliah



}
