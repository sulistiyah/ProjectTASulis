const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload");
const upload = require("../middleware/upload");

let routes = (app) => {

  router.post("/upload", upload.single("file"), uploadController.uploadFiles);

  return app.use("/", router);
};

module.exports = routes;