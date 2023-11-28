const { authJwt} = require("../middleware")
const controller = require("../controllers/face_controller.js");
const multer = require('multer')
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const upload = require('../middleware/multer.js');

module.exports = app => {
  const router = require("express").Router()

  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-type, Accept"
    );
    next();
  });

  //route awal untuk semua api mahasiswa
  app.use("/api/mahasiswa", router)

  //GET ALL My Profile - Data Mahasiswa //mengcek wajah dari database 
  // router.post(   "/check-face", 
  //               [ authJwt.verifikasiToken ], 
  //               controller.checkFace)

  //GET My Profile By Id - Data Mahasiswa // mendaftarkan wajah
  router.post(   "/create-face", upload.single('images', 'label'), 
                [ authJwt.verifikasiToken ], 
                controller.faceUpload)
}