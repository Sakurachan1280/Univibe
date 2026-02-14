const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    console.log(`>> [CLOUDINARY PARAMS] Preparing for file: ${file.originalname} (${file.fieldname})`);
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    if (isAudio) {
      return {
        folder: 'spoti_music',
        resource_type: 'video',
        allowed_formats: ['mp3', 'wav', 'm4a', 'flac'],
        public_id: `song-${uniqueSuffix}`,
        timeout: 120000
      };
    }

    else if (file.mimetype.startsWith('image/')) {
      return {
        folder: 'spoti_images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: `image-${uniqueSuffix}`,
        timeout: 60000
      };
    }

    else {
      return {
        folder: 'spoti_others',
        resource_type: 'raw',
        public_id: `other-${uniqueSuffix}`,
        timeout: 60000
      };
    }
  },
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
  limits: { fileSize: 50 * 1024 * 1024 }
});

module.exports = upload;