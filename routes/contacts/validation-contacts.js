const joi = require("joi");

const schemaCreateContact = joi.object({
  name: joi.string().min(1).max(255).required(),
  email: joi.string().email({ ignoreLength: true }).required(),
  phone: joi
    .string()
    .regex(/^(\d*|\+*|-*| *|\(*|\)*)*$/)
    .required()
    .messages({
      "string.pattern.base":
        'For the phone number allowed nambers, spaces and symbols: "+", "-", "(", ")"',
    }),
  favorite: joi.bool().default(false),
});

const schemaUpdateContact = joi
  .object({
    name: joi.string().min(1).max(255),
    email: joi.string().email({ ignoreLength: true }),
    phone: joi
      .string()
      .regex(/^(\d*|\+*|-*| *|\(*|\)*)*$/)
      .messages({
        "string.pattern.base":
          'For the phone number allowed nambers, spaces and symbols: "+", "-", "(", ")"',
      }),
    favorite: joi.bool(),
  })
  .min(1);

const schemaUpdateStatusContact = joi.object({
  favorite: joi
    .bool()
    .required()
    .messages({ "any.required": "missing field favorite" }),
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
    });
  }
};

module.exports = {
  createContact: async (req, res, next) => {
    return await validate(schemaCreateContact, req.body, next, res);
  },
  updateContact: async (req, res, next) => {
    return await validate(schemaUpdateContact, req.body, next, res);
  },
  updateStatusContact: async (req, res, next) => {
    return await validate(schemaUpdateStatusContact, req.body, next, res);
  },
};
