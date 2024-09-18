// const multer = require('multer');
// const path = require('path');

// // Configurar multer
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'src/fileUpload');
//   },
//   filename: function(req, file, cb) {
//     const extname = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${Date.now()}${extname}`);
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
