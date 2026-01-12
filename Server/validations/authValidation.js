const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  display_name: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const profileUpdateSchema = Joi.object({
  display_name: Joi.string(),
  bio: Joi.string(),
  dob: Joi.date(),
  genres_interest: Joi.array().items(Joi.string()),
  avatar_url: Joi.string(),
  cover_url: Joi.string()
});

module.exports = { registerSchema, loginSchema, profileUpdateSchema };