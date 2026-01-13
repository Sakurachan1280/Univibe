const Joi = require('joi');

const createPlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').optional(),
  is_public: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

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