const Joi = require("joi");

module.exports = {
  patient: (restaurantObj) => {
    const schema = Joi.object({
      nom: Joi.string().min(3).max(10).required(),
      image: Joi.string().min(3).max(50),
      description: Joi.string().min(3).max(50).required(),
      h_ouverture: Joi.string().min(5).max(50).required(),
      h_fermeture: Joi.string().min(5).max(50).required(),
      // email: Joi.string().min(5).max(50),
      telephone: Joi.string(),
      latitude: Joi.double(),
      longitude: Joi.double(),

      categorieFood: Joi.array().items(Joi.objectId()),
    });

    return schema.validate(restaurantObj);
  },
};
