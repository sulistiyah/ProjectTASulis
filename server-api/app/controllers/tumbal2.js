const db = require("../models");
const FaceModel = db.faceModel;
const { Op } = db.Sequelize;
const canvas = require('canvas');
const faceapi = require('face-api.js');
const { validationResult } = require('express-validator');

async function uploadLabeledImages(images, label) {
  try {
    let counter = 0;
    const descriptions = [];

    // Loop melalui gambar
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      counter = (i / images.length) * 100;
      console.log(`Progres = ${counter}%`);

      // Membaca setiap wajah dan menyimpan deskripsi wajah dalam array descriptions
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      descriptions.push(detections.descriptor);
    }

    // Membuat dokumen wajah baru dengan label yang diberikan dan menyimpannya di DB
    const createFace = await FaceModel.create({
      label: label,
      descriptions: descriptions,
    });

    return true;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getDescriptorsFromDB(image) {
  try {
    // Mengambil semua data wajah dari database
    const faces = await FaceModel.findAll();

    const labeledDescriptors = faces.map((face) => {
      const descriptors = face.descriptions.map((desc) => new Float32Array(Object.values(desc)));
      return new faceapi.LabeledFaceDescriptors(face.label, descriptors);
    });

    // Memuat face matcher untuk mencari wajah yang cocok
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    // Membaca gambar menggunakan canvas atau metode lainnya
    const img = await canvas.loadImage(image);
    const temp = faceapi.createCanvasFromMedia(img);
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(temp, displaySize);

    // Menemukan wajah yang cocok
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));

    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
}

exports.faceUpload = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const File1 = req.files.File1.tempFilePath;
  const File2 = req.files.File2.tempFilePath;
  const File3 = req.files.File3.tempFilePath;
  const label = req.body.label;

  try {
    await uploadLabeledImages([File1, File2, File3], label);
    res.json({ message: "Data wajah berhasil disimpan" });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Terjadi kesalahan, silakan coba lagi." });
  }
};

exports.checkFace = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const File1 = req.files.File1.tempFilePath;

  try {
    const result = await getDescriptorsFromDB(File1);
    res.json({ result });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Kesalahan Server Internal" });
  }
};
