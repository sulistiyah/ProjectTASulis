module.exports = app => {
    const programStudi = require("../controllers/program_studi_controller.js")
    const router = require("express").Router()

    // Create a new Program Studi
    router.post("/program_studi", programStudi.create);

    //GET Data Program Studi
    router.get("/program_studi", programStudi.findAll)

    //GET Data Program Studi By Id
    router.get("/program_studi/:id", programStudi.findOne)

    //PUT Data Program Studi By id => Edit/Update Data
    router.put("/program_studi/:id", programStudi.update)

    //DELETE Data Program Studi By Id
    router.delete("/program_studi/:id", programStudi.delete)

    app.use("/api", router)

}