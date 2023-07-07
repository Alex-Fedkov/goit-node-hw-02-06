const joi = require("joi");

const subscriptions = ["starter", "pro", "business"];

const schemaRegistration = joi.object({
  password: joi.string().min(8).max(20).required(),
  email: joi.string().email({ ignoreLength: true }).required(),
  subscription: joi
    .any()
    .valid(...subscriptions)
    .default("starter"),
  token: joi.string().default(null),
});

const schemaLogin = joi.object({
  password: joi.string().min(8).max(20).required(),
  email: joi.string().email({ ignoreLength: true }).required(),
});

const schemaSubscription = joi.object({
  subscription: joi
    .any()
    .valid(...subscriptions)
    .required(),
});

const validate = async (schema, obj, next, res) => {
  console.log("validation");
  try {
    await schema.validateAsync(obj);
    return next();
  } catch (err) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: err.message.replace(/"/g, "'"),
      data: err.message.replace(/"/g, "'"),
    });
  }
};

module.exports = {
  registration: async (req, res, next) => {
    return await validate(schemaRegistration, req.body, next, res);
  },
  login: async (req, res, next) => {
    return await validate(schemaLogin, req.body, next, res);
  },
  updateSubscription: async (req, res, next) => {
    return await validate(schemaSubscription, req.body, next, res);
  },
};
