const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
  },
  image: {
    type: String,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  h_ouverture: {
    type: Date,
  },
  h_fermeture: {
    type: Date,
  },
  // email: {
  //   type: String,
  //   // required: true,
  //   minlength: 5,
  //   maxlength: 50,
  // },
  telephone: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },

  latitude: {
    type: Double,
  },
  longitude: {
    type: Double,
  },

  categorieFood: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategorieFood",
    },
  ],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

exports.restaurantSchema = restaurantSchema;
exports.Restaurant = Restaurant;
