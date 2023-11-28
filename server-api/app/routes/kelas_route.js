module.exports = app => {
    const kelas = require("../controllers/kelas_controller.js")
    const router = require("express").Router()

    //Create a new Class
    router.post("/kelas", kelas.create);

    //GET Data Class
    router.get("/kelas", kelas.findAll)

    //GET Data Class By Id
    router.get("/kelas/:id", kelas.findOne);

    //PUT Classs by Id => Edit/Update Data Class
    router.put("/kelas/:id", kelas.update)

    //DELETE Data Class By id
    router.delete("/kelas/:id", kelas.delete)

    app.use("/api", router)

}