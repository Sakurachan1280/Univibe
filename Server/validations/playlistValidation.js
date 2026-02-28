const Joi = require('joi');

const createPlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').optional(),
  // FormData gửi boolean dạng string "true"/"false"
  is_public: Joi.boolean().truthy('true').falsy('false').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  // cover_image đã được multer xử lý riêng, bỏ qua ở đây
}).unknown(true);

const updatePlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('').optional(),
  is_public: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const addSongSchema = Joi.object({
  songId: Joi.string().required()
});

module.exports = {
  createPlaylistSchema,
  updatePlaylistSchema,
  addSongSchema
};