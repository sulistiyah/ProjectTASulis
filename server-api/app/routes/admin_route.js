module.exports = app => {
    const admin = require("../controllers/admin_controller.js")
    const router = require("express").Router()

    app.use("/api/admin", router)

    //ADMIN
    router.post("/create_admin", admin.createAdmin)
    router.post("/login", admin.loginAdmin)

    //PROGRAM STUDI
    router.post("/program_studi", admin.createProgramStudi);
    router.get("/program_studi", admin.findAllProgramStudi)
    router.get("/program_studi/:id", admin.findOneProgramStudi);
    router.put("/program_studi/:id", admin.updateProgramStudi)
    router.delete("/program_studi/:id", admin.deleteProgramStudi)

    //KELAS
    router.post("/kelas", admin.createKelas)
    router.get("/kelas", admin.findAllKelas)
    router.get("/kelas/:id", admin.findOneKelas)
    router.put("/kelas/:id", admin.updateKelas)
    router.delete("/kelas/:id", admin.deleteKelas)
    
}