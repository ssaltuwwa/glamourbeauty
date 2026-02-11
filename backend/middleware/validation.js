const Joi = require('joi');

const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),
  
  createService: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    category: Joi.string().valid('hair', 'nails', 'face', 'body', 'spa', 'makeup').required(),
    duration: Joi.number().integer().min(15).max(300).required(),
    price: Joi.number().min(0).required()
  }),
  
  createAppointment: Joi.object({
    service: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    timeSlot: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    notes: Joi.string().max(200)
  })
};

const validate = (schema) => (req, res, next) => {
  const { error } = schemas[schema].validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

module.exports = validate;