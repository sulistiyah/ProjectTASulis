const { verifikasiRegister } = require("../middleware");
const { authJwt} = require("../middleware")
const controller = require("../controllers/auth_dosen_controller.js");


module.exports = app => {
  const router = require("express").Router()

  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //route awal untuk semua api dosen
  app.use("/api/dosen", router)

  //POST untuk register dosen
  router.post(  "/register",
                [ verifikasiRegister.checkDuplicateDataDosen ],
                controller.register);

  //POST untuk login dosen
  router.post(  "/login", controller.login);

  //GET ALL My Profile - Data dosen
  router.get(   "/my_profile", 
                [ authJwt.verifikasiToken ], 
                controller.findAllMyProfile)

  //GET My Profile By Id - Data dosen
  router.get(   "/my_profile/:id", 
                [ authJwt.verifikasiToken ], 
                controller.findOneMyProfileById)

  //PUT My Profile By Id (Edit Profil) - Data dosen
  router.put(   "/my_profile/:id",
                [ authJwt.verifikasiToken ],
                controller.editProfil) 

  //PUT Change Password By Id (Ganti Kata Sandi) - Data dosen
  router.put( "/change_password/:id",
              [ authJwt.verifikasiToken ],
              controller.changePassword)


  
};
