const mongoose = require("mongoose");

// nom, image, description, prix, restaurantId
const foodSchema = new mongoose.Schema({
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
    minlength: 3,
    maxlength: 255,
  },
  prix: {
    type: Number,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

const Food = mongoose.model("Food", foodSchema);

exports.foodSchema = foodSchema;
exports.Food = Food;
