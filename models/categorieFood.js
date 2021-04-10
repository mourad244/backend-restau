const mongoose = require("mongoose");

const categorieFoodSchema = new mongoose.Schema({
  // nom, image, [restaurant]
  nom: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
  },
  restaurantsId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  ],
});

const CategorieFood = mongoose.model("CategorieFood", categorieFoodSchema);

exports.categorieFoodSchema = categorieFoodSchema;
exports.CategorieFood = CategorieFood;
