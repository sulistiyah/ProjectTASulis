const db = require("../models")
const auth_config = require("../config/auth_config")
const  jwt = require("jsonwebtoken")
const multer = require('multer')
const { validationResult } = require('express-validator');
const faceapi = require('face-api.js')
const { Canvas, Image } = require('canvas')
const canvas = require('canvas')
const Op = db.Sequelize.Op;
const UserMahasiswa = db.userMahasiswa
const Face = db.face
const ProgramStudi = db.programStudi
const Kelas = db.kelas

// Konfigurasi multer untuk menangani unggah file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//Mendeteksi gambar dan melabel gambar yang terdeteksi serta dimasukan ke dalam database yang ada
async function uploadLabeledImages(images, label) {
    try{
        let counter = 0
        const descriptions = []

        //Loop melalui gambar
        for (let i = 0; i < images.length; i++) {
            const img = await canvas.loadImage(images[i].buffer)
            counter = (i / images.length) * 100
            console.log(`Progress = ${counter}%`)

            //Membaca setidap wajah dan menyimpan deskripsi wajah dalam araay descriptions
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor)
        }

        //Membuat dokumen wajah baru dengan label yang diberikan dan menyimpannya ke dalam database
       await Face.create({
            label : label,
            descriptions : descriptions
        })

    } catch (err) {
        console.log(err)
        return err
    }

}

//face Uplaod - upload data wajah ke dalam database
exports.faceUpload = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            statusCode : 400,
            message : errors.array()
        })
    }
    
    // const File1 = req.files.File1.tempFilePath
    // const File2 = req.files.File2.tempFilePath
    // const File3 = req.files.File3.tempFilePath
    const label = req.body.label

    //Pastikan anda sudah menyesuaikan dengan nama field pada postman (images, label)
    const images = req.files

    try {
        await uploadLabeledImages(images, label )
        res.status(200).json({
            statusCode : 200,
            message : "Data Wajah Berhasil Disimpan"
        })
    } catch (err) {
        console.log('Error : ', err)
        res.status(500).json({
            statusCode : 500,
            message : "Terjadi kesalahan, silahkan coba lagi."
        })
        
    }
}


//Mendapatkan data deskripsi dari database
async function getDescriptorsFromDB(image) {
    try {
        //Mengambil semua data wajah dari database
        const faces = await Face.findAll()

        const labeledDescriptors = faces.map((face) => {
            const descriptors = face.descriptions.map((desc) => new Float32Array(Object.values(desc)))
            return new faceapi.LabeledFaceDescriptors(face.label, descriptors)
        })

        //Memuat face matcher untuk emncari wajah yang cocok
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)
        
        //Membaca gambar menggunakan canvas atau metode lainnya
        const img = await canvas.loadImage(image)
        const temp = faceapi.createCanvasFromMedia(img)
        const displaySize = {
            width: img.width, 
            height: img.height
        }
        faceapi.matchDimensions(temp, displaySize)

        //Menemukan wajah yang cocok 
        const detections = await faceapi.detectAllFaces(img). withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor))

        return results

    } catch (err) {
        console.log(err)
        return err
        
    }
}


//proses face recognition 
// exports.checkFace = async (req, res) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             statusCode : 400,
//             message : errors.array()
//         })
//     }

//     const File1 = req.files.File1.tempFilePath

//     try {
//         const result = await getDescriptorsFromDB(File1)
//         res.json({
//             result
//         })
//     } catch (err) {
//         console.log('Error : ', err)
//         res.status(500).json({
//             statusCode : 500,
//             message : "Kesalahan Server Internal"
//         })
//     }
// }


// //Proses Face Upload Images Mahasiswa
// exports.faceUpload = (req, res) => {
    
// }


// // .then(data => {
// //     if (!data) {
// //         res.status(404).send({
// //             statusCode : 404,
// //             message: "Failed Process Face"
// //         });
// //     } else {
// //         UserMahasiswa.findByPk(req.body.userMahasiswaId, { include: ["programStudi", "kelas"] })
// //         .then(userMahasiswa => {
// //             if (!userMahasiswa) {
// //                 res.status(404).send({
// //                     statusCode : 404,
// //                     message: `User Mahasiswa Not Found`
// //                 });
// //             } else {
// //                 res.status(200).send({
// //                     statusCode : 200,
// //                     message: "Succes Upload Face",
// //                     data: {
// //                         id: data.id,
// //                         label: data.label,
// //                         descriptions: data.descriptions,
// //                         userMahasiswa: {
// //                             id : data.userMahasiswa.id,
// //                             nim : data.userMahasiswa.nim,
// //                             nama : data.userMahasiswa.nama,
// //                             programStudi: {
// //                                 id: programStudi.id,
// //                                 kodeProdi: programStudi.kodeProdi,
// //                                 programStudi: programStudi.programStudi,
// //                             },
// //                             kelas: {
// //                                 id: kelas.id,
// //                                 kodeKelas: kelas.kodeKelas,
// //                                 kelas: kelas.kelas,
// //                             },                                
// //                             noTelepon: data.noTelepon
// //                         }                        
// //                     }
// //                 })
// //             }
// //         })
// //         .catch(err => {
// //             res.status(500).send({
// //                 statusCode : 500,
// //                 message: "Error retrieving My Profile with id=" + id
// //             });
// //         });
// //     }
// // })




// //Proses Login Mahasiswa
// exports.login = (req, res) => {
//     UserMahasiswa.findOne({
//         where : {
//             nim : req.body.nim
//         },
//         include : [
//             {
//                 model : ProgramStudi,
//                 as: "programStudi"
//             },
//             {
//                 model : Kelas,
//                 as : "kelas"
//             }            
//         ]    
//     })
//     .then(data => {
//         if(!data) {
//             return res.status(404).send({
//                 statusCode : 404,
//                 message : "User Not Found."
//             })
//         } 

//         const passwordIsValid = bcrypt.compareSync(
//             req.body.password,
//             data.password
//         )

//         if(!passwordIsValid) {
//             return res.status(401).send({
//                 statusCode : 401,
//                 accessToken : null,
//                 message: "Invalid Password"
//             })
//         }

//         const token = jwt.sign(
//             { id: data.id },
//             auth_config.secret,
//             {
//               algorithm: 'HS256',
//               allowInsecureKeySizes: true,
//               expiresIn: 86400, // 24 hours
//             }
//         );

//         res.status(200).send({
//             statusCode : 200,
//             message: "Login Successful",
//             data: {
//                 id: data.id,
//                 nim: data.nim,
//                 nama: data.nama,
//                 programStudi: {
//                     id : data.programStudi.id,
//                     kodeProdi : data.programStudi.kodeProdi,
//                     programStudi : data.programStudi.programStudi
//                 },
//                 kelas: {
//                     id : data.kelas.id,
//                     kodeKelas : data.kelas.kodeKelas,
//                     kelas : data.kelas.kelas
//                 },                          
//                 noTelepon: data.noTelepon,
//                 accessToken : token
                
//             }
//         });       
//     })
//     .catch(err => {
//         res.status(500).send({
//             statusCode : 500,
//             message: err.message || "Some error occurred while login the User."
//         });
//     });
// }


// //Proses Get Data Mahasiswa - GET My Profile
// exports.findAllMyProfile = (req, res) => {
//     const nim = req.query.nim
//     const condition = nim? { nim : { [Op.like]: `%${nim}%` } } : null

//     UserMahasiswa.findAll({
//         where : condition,
//         include : [
//             {
//                 model : ProgramStudi,
//                 as: "programStudi"
//             },
//             {
//                 model : Kelas,
//                 as : "kelas"
//             }]    
//         })
//         .then(data => {
//             const formattedData = data.map(mahasiswa => ({
//                 id: mahasiswa.id,
//                 nim: mahasiswa.nim,
//                 nama: mahasiswa.nama,
//                 programStudi: {
//                     id: mahasiswa.programStudi.id,
//                     kodeProdi: mahasiswa.programStudi.kodeProdi,
//                     programStudi: mahasiswa.programStudi.programStudi
//                 },
//                 kelas: {
//                     id: mahasiswa.kelas.id,
//                     kodeKelas: mahasiswa.kelas.kodeKelas,
//                     kelas: mahasiswa.kelas.kelas
//                 },
//                 noTelepon: mahasiswa.noTelepon,
//                 image: mahasiswa.image
//             }));
        
//             res.status(200).send({
//                 statusCode : 200,
//                 message: "Succes Get Data Mahasiswa",
//                 data: formattedData
//             });
            
//         })
//         .catch(err => {
//             res.status(500).send({
//                 statusCode : 500,
//                 message:
//                 err.message || "Failed Get Data Mahasiswa"
//             })
//         })
// }


// //Proses GET Data Mahasiswa - GET My Profile By Id
// exports.findOneMyProfileById = (req, res) => {
//     const id = req.params.id;
  
//     UserMahasiswa.findByPk(id, { include: ["programStudi", "kelas"] })
//       .then(data => {
//         if (data) {
//           res.status(200).send({
//             statusCode : 200,
//             message: "Succes Get My Profile By Id",
//             data: {
//                 id: data.id,
//                 nim: data.nim,
//                 nama: data.nama,
//                 programStudi: {
//                     id : data.programStudi.id,
//                     kodeProdi : data.programStudi.kodeProdi,
//                     programStudi : data.programStudi.programStudi
//                 },
//                 kelas: {
//                     id : data.kelas.id,
//                     kodeKelas : data.kelas.kodeKelas,
//                     kelas : data.kelas.kelas
//                 },                          
//                 noTelepon: data.noTelepon,
//                 image: data.image
                
//             }
//           })
//         } else {
//           res.status(404).send({
//             statusCode : 404,
//             message: `Cannot find My Profile with id=${id}.`
//           });
//         }
//       })
//       .catch(err => {
//         res.status(500).send({
//             statusCode : 500,
//             message: "Error retrieving My Profile with id=" + id
//         });
//       });
// };


// //Proses Edit Profile - PUT data Edit Profil
// exports.editProfil = (req, res) => {
//     UserMahasiswa.update(req.body, {
//         where: {
//             id: req.params.id
//         }
//     })
//     .then(result => {
//         if (result[0]) {
//             UserMahasiswa.findByPk(req.params.id, {
//                 include: [
//                     {
//                         model: ProgramStudi,
//                         as: "programStudi"
//                     },
//                     {
//                         model: Kelas,
//                         as: "kelas"
//                     }
//                 ]
//             })
//             .then(mahasiswa => {
//                 const formattedData = {
//                     id: mahasiswa.id,
//                     nim: mahasiswa.nim,
//                     nama: mahasiswa.nama,
//                     programStudi: {
//                         id: mahasiswa.programStudi.id,
//                         kodeProdi: mahasiswa.programStudi.kodeProdi,
//                         programStudi: mahasiswa.programStudi.programStudi
//                     },
//                     kelas: {
//                         id: mahasiswa.kelas.id,
//                         kodeKelas: mahasiswa.kelas.kodeKelas,
//                         kelas: mahasiswa.kelas.kelas
//                     },
//                     noTelepon: mahasiswa.noTelepon
//                 };

//                 res.status(200).send({
//                     statusCode : 200,
//                     message: "Profile Update Successful",
//                     data: formattedData
//                 });
//             })
//             .catch(err => {
//                 res.status(500).send({
//                     statusCode : 500,
//                     message: err.message || "Some error occurred while retrieving the User."
//                 });
//             });
//         } else {
//             res.status(404).send({
//                 statusCode : 404,
//                 message: `Cannot update profile with id=${req.params.id}. Maybe profile was not found or req.body is empty!`
//             });
//         }
//     })
//     .catch(err => {
//         res.status(500).send({
//             statusCode : 500,
//             message: err.message || "Some error occurred while updating the User."
//         });
//     });
// }


// //Proses Penggantian Password - PUT data Edit Profil
// exports.changePassword = (req, res) => {
//     const id = req.params.id;
//     const { password, newPassword, confirmPassword } = req.body;

//     // Validasi bahwa newPassword dan confirmPassword sama
//     if (newPassword !== confirmPassword) {
//         return res.status(400).send({
//             statusCode : 400,
//             message: "New password and confirm password do not match."
//         });
//     }

//     UserMahasiswa.findByPk(id)
//         .then(data => {
//             if (!data) {
//                 return res.status(404).send({
//                     statusCode : 404,
//                     message: `User with id=${id} not found.`
//                 });
//             }

//             // Validasi bahwa password lama sesuai
//             const passwordIsValid = bcrypt.compareSync(password, data.password);
//             if (!passwordIsValid) {
//                 return res.status(401).send({
//                     statusCode : 401,
//                     message: "Invalid current password."
//                 });
//             }

//             // Enkripsi newPassword
//             const hashedNewPassword = bcrypt.hashSync(newPassword, 8);

//             // Update password baru ke dalam database
//             UserMahasiswa.update(
//                 {   password: hashedNewPassword,
//                     rePassword : hashedNewPassword },
//                 {   where: { id: id } }
//             )
//             .then(() => {
//                 res.status(200).send({
//                     statusCode : 200,
//                     message: "Password updated successfully."
//                 });
//             })
//             .catch(err => {
//                 res.status(500).send({
//                     statusCode : 500,
//                     message: err.message || "Some error occurred while updating the password."
//                 });
//             });
//         })
//         .catch(err => {
//             res.status(500).send({
//                 statusCode : 400,
//                 message: err.message || "Some error occurred while retrieving the User."
//             });
//         });
// };