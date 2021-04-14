const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
  },
  images: {
    type: Array,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  h_ouverture: {
    type: String,
  },
  h_fermeture: {
    type: String,
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
  qrCode: {
    type: String,
  },

  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },

  categorieFoodsId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategorieFood",
    },
  ],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

exports.restaurantSchema = restaurantSchema;
exports.Restaurant = Restaurant;
