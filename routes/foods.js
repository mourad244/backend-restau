const { Food } = require("../models/food");
const auth = require("../middleware/auth");
const express = require("express");
const uploadImages = require("../middleware/uploadImages");
const deleteImages = require("../middleware/deleteImages");
const { Restaurant } = require("../models/restaurant");
const validations = require("../startup/validations");

const router = express.Router();

const validateObjectId = require("../middleware/validateObjectId");

router.get("/", auth, async (req, res) => {
  const foods = await Food.find().select("-__v").sort("nom");
  res.send(foods);
});

router.get("/:id", auth, async (req, res) => {
  const food = await Food.findById(req.params.id).select("-__v");
  if (!food) return res.status(404).send("rendez vous n'existe pas");
  res.send(food);
});

router.post("/", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
    const { error } = validations.food(req.body);
    if (error) {
      deleteImages(req.files);
      return res.status(400).send(error.details[0].message);
    }

    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if (!restaurant) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non valide.");
    }

    let filtered = {};
    for (let item in req.files) {
      filtered[item] = req.files[item];
    }

    const { nom, description, prix, restaurantId } = req.body;
    const { image: images } = filtered;

    const food = new Food({
      nom: nom,
      images: images ? images.map((file) => file.path) : [],
      description: description,
      prix: prix,
      restaurant: restaurantId,
    });
    await food.save();
    res.send(food);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${err}`,
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
    const { error } = validations.food(req.body);
    if (error) {
      deleteImages(req.files);
      return res.status(400).send(error.details[0].message);
    }

    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if (!restaurant) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non valide.");
    }

    const { nom, description } = req.body;

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      {
        nom: nom,

        description: description,
        restaurant: 
      },
      { new: true }
    );
    await food.save();

    if (!food)
      return res.status(404).send("rendez vous avec cet id n'existe pas");

    res.send(food);
  } catch (error) {}
});

router.get("/:id", validateObjectId, auth, async (req, res) => {
  const food = await Food.findById(req.params.id).select("-__v");

  if (!food)
    return res.status(404).send("le rendez vous avec cet id n'existe pas");
});

router.delete("/:id", auth, async (req, res) => {
  const food = await Food.findByIdAndRemove(req.params.id);
  if (!food)
    return res.status(404).send("rendez vous avec cette id n'existe pas");
});

module.exports = router;
