module.exports = app => {
    const mataKuliah = require("../controllers/mata_kuliah_controller.js")
    const router = require("express").Router()

    // Create a new Mata Kuliah
    router.post("/mata_kuliah", mataKuliah.create);

    //GET Data Mata Kuliah
    router.get("/mata_kuliah", mataKuliah.findAll)

    //GET Data Mata Kuliah By Id
    router.get("/mata_kuliah/:id", mataKuliah.findOne)

    //PUT Data Mata Kuliah By id => Edit/Update Data
    router.put("/mata_kuliah/:id", mataKuliah.update)

    //DELETE Data Mata Kuliah By Id
    router.delete("/mata_kuliah/:id", mataKuliah.delete)

    app.use("/api", router)

}