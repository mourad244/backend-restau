const Joi = require('joi');

module.exports = {
	restaurant: (restaurantObj) => {
		const schema = Joi.object({
			nom: Joi.string().min(3).max(50).required(),
			images: Joi.array().allow(null),
			description: Joi.string().min(3).max(50),
			h_ouverture: Joi.string(),
			h_fermeture: Joi.string(),
			// email: Joi.string().min(5).max(50),
			telephone: Joi.string(),
			qrCode: Joi.string(),
			latitude: Joi.number(),
			longitude: Joi.number(),

			categorieFoodsId: Joi.array().items(Joi.objectId())
		});

		return schema.validate(restaurantObj);
	},

	food: (foodObj) => {
		const schema = Joi.object({
			nom: Joi.string().min(3).max(50).required(),
			images: Joi.array().allow(null),
			description: Joi.string().min(3).max(255),
			prix: Joi.number().required(),
			restaurantId: Joi.objectId()
		});
		return schema.validate(foodObj);
	},

	categorieFood: (categorieFoodObj) => {
		const schema = Joi.object({
			nom: Joi.string().min(3).max(10).required(),
			images: Joi.array().allow(null)
			// restaurantsId: Joi.array().items(Joi.objectId())
		});
		return schema.validate(categorieFoodObj);
	},

	user: (userObj) => {
		const schema = Joi.object({
			name: Joi.string().min(2).max(50),
			email: Joi.string().min(5).max(255).required().email(),
			password: Joi.string().min(5).max(255).required()
		});

		return schema.validate(userObj);
	}
};
