const express = require('express');
const multer = require('multer');
const { validationResult } = require('express-validator');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const { Face } = require('../models'); // Pastikan telah mengimport model Face sesuai struktur model Anda

const router = express.Router();

// Konfigurasi multer untuk menangani unggah file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function untuk mengunggah dan menyimpan gambar ke dalam database
async function uploadLabeledImages(images, label) {
    try {
        let counter = 0;
        const descriptions = [];

        // Loop melalui gambar
        for (let i = 0; i < images.length; i++) {
            const img = await canvas.loadImage(images[i].buffer);
            counter = (i / images.length) * 100;
            console.log(`Progress = ${counter}%`);

            // Membaca setiap wajah dan menyimpan deskripsi wajah dalam array descriptions
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);
        }

        // Membuat dokumen wajah baru dengan label yang diberikan dan menyimpannya ke dalam database
        await Face.create({
            label: label,
            descriptions: descriptions
        });

        return true;
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Endpoint untuk mengupload wajah melalui Postman
router.post('/upload-face', upload.array('images', 3), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            statusCode: 400,
            message: errors.array()
        });
    }

    const label = req.body.label;

    // Pastikan Anda sudah menyesuaikan dengan nama field pada Postman (images, label)
    const images = req.files;

    try {
        await uploadLabeledImages(images, label);
        res.status(200).json({
            statusCode: 200,
            message: "Data Wajah Berhasil Disimpan"
        });
    } catch (err) {
        console.log('Error:', err);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan, silakan coba lagi."
        });
    }
});

module.exports = router;
