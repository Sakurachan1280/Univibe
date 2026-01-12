const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream';
    const prefix = isAudio ? 'song' : 'image';
    cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log(`>> [MULTER CHECK] File: ${file.originalname} - Type: ${file.mimetype}`);

  const isImage = file.mimetype.startsWith('image/');
  const isAudio = file.mimetype.startsWith('audio/');
  const isOctet = file.mimetype === 'application/octet-stream'; 

  if (isImage || isAudio || isOctet) {
    cb(null, true);
  } else {
    cb(new Error(`File format not supported! Got: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = upload;