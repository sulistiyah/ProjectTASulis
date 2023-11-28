const db = require("../models");
const FaceModel = db.faceModel;
const { Op } = db.Sequelize;

function uploadLabeledImages(images, label) {
  let counter = 0;
  const descriptions = [];

  // Memuat semua gambar dan membuat promises
  const loadImagePromises = images.map((image) => {
    return canvas.loadImage(image).then((img) => {
      counter = (counter + 1 / images.length) * 100;
      console.log(`Progres = ${counter}%`);
      return faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    });
  });

  // Menggunakan Promise.all untuk menunggu semua promises untuk diselesaikan
  return Promise.all(loadImagePromises)
    .then((detectionsArray) => {
      // Mengekstrak deskriptor dari hasil deteksi
      detectionsArray.forEach((detections) => {
        descriptions.push(detections.descriptor);
      });

      // Membuat dokumen wajah baru dengan label yang diberikan dan menyimpannya ke dalam DB
      return FaceModel.create({
        label: label,
        descriptions: descriptions,
      });
    })
    .then(() => {
      return true; // Menandakan keberhasilan
    })
    .catch((error) => {
      console.log(error);
      return error; // Menandakan kegagalan
    });
}

function getDescriptorsFromDB(image) {
  // Mengambil semua data wajah dari database
  return FaceModel.findAll()
    .then((faces) => {
      const labeledDescriptors = faces.map((face) => {
        const descriptors = face.descriptions.map((desc) => new Float32Array(Object.values(desc)));
        return new faceapi.LabeledFaceDescriptors(face.label, descriptors);
      });

      // Memuat face matcher untuk mencari wajah yang cocok
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

      // Membaca gambar menggunakan canvas atau metode lainnya
      return canvas.loadImage(image)
        .then((img) => {
          const temp = faceapi.createCanvasFromMedia(img);
          const displaySize = { width: img.width, height: img.height };
          faceapi.matchDimensions(temp, displaySize);

          // Menemukan wajah yang cocok
          return faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
            .then((detections) => {
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
              return results;
            });
        });
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
}

// Contoh penggunaan:
app.post("/post-face", (req, res) => {
  const File1 = req.files.File1.tempFilePath;
  const File2 = req.files.File2.tempFilePath;
  const File3 = req.files.File3.tempFilePath;
  const label = req.body.label;

  uploadLabeledImages([File1, File2, File3], label)
    .then((result) => {
      if (result === true) {
        res.json({ message: "Data wajah berhasil disimpan" });
      } else {
        res.json({ message: "Terjadi kesalahan, silakan coba lagi." });
      }
    })
    .catch((error) => {
      console.log('Error:', error);
      res.status(500).json({ message: "Kesalahan Server Internal" });
    });
});

app.post("/check-face", (req, res) => {
  const File1 = req.files.File1.tempFilePath;

  getDescriptorsFromDB(File1)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      console.log('Error:', error);
      res.status(500).json({ message: "Kesalahan Server Internal" });
    });
});
