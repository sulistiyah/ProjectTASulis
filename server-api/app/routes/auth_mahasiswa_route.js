const { verifikasiRegister } = require("../middleware");
const { authJwt} = require("../middleware")
const controller = require("../controllers/auth_mahasiswa_controller.js");


module.exports = app => {
  const router = require("express").Router()

  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //route awal untuk semua api mahasiswa
  app.use("/api/mahasiswa", router)

  //POST untuk register mahasiswa
  router.post(  "/register",
                [ verifikasiRegister.checkDuplicateDataMahasiswa ], 
                controller.register);

  //POST untuk login mahasiswa
  router.post(  "/login", controller.login);

  //GET ALL My Profile - Data Mahasiswa
  router.get(   "/my_profile", 
                [ authJwt.verifikasiToken ], 
                controller.findAllMyProfile)

  //GET My Profile By Id - Data Mahasiswa
  router.get(   "/my_profile/:id", 
                [ authJwt.verifikasiToken ], 
                controller.findOneMyProfileById)

  //PUT My Profile By Id (Edit Profil) - Data Mahasiswa
  router.put(   "/my_profile/:id",
                [ authJwt.verifikasiToken ],
                controller.editProfil) 

  //PUT Change Password By Id (Ganti Kata Sandi) - Data Mahasiswa
  router.put( "/change_password/:id",
              [ authJwt.verifikasiToken ],
              controller.changePassword)


  
};
