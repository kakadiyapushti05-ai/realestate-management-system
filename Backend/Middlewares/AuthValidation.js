const Joi = require('joi');

/* 
   SIGNUP VALIDATION
 */
exports.signupvalidation = (req, res, next) => {

  const schema = Joi.object({
    name: Joi.string().min(3).required(),

    email: Joi.string().email().required(),
     contact: Joi.string()              
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Contact must be 10 digits',
        'string.empty': 'Contact is required'
      }),

    password: Joi.string().min(6).required(),

    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Password and Confirm Password must match'
      }),

    role: Joi.string()
      .valid('admin', 'user', 'broker')
      .required()
  });

  const { error } = schema.validate(req.body, {
    abortEarly: true,
    allowUnknown: false   
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};


/* 
   LOGIN VALIDATION
 */
exports.loginvalidation = (req, res, next) => {

  const schema = Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};





/* 
   LOGIN VALIDATION
 */
exports.loginvalidation = (req, res, next) => {

  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Invalid email',
        'string.empty': 'Email is required'
      }),

    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next(); 
};
