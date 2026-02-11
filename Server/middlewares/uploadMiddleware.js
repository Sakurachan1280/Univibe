const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream';

    if (isAudio) {
      return {
        folder: 'spoti_music',
        resource_type: 'video',
        allowed_formats: ['mp3', 'wav', 'm4a', 'flac'],
        public_id: `song-${Date.now()}`,
        timeout: 120000 // 2 phút timeout cho file lớn
      };
    }

    else if (file.mimetype.startsWith('image/')) {
      return {
        folder: 'spoti_images',    // Tên thư mục chứa ảnh
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: `image-${Date.now()}`,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      };
    }

    else {
      return {
        folder: 'spoti_others',
        resource_type: 'raw'
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