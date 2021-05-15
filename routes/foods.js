const { Food } = require("../models/food");
const auth = require("../middleware/auth");
const express = require("express");
const uploadImages = require("../middleware/uploadImages");
const deleteImages = require("../middleware/deleteImages");
const { Restaurant } = require("../models/restaurant");
const validations = require("../startup/validations");
const router = express.Router();

const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  const foods = await Food.find()
    .populate("restaurantId", "nom")
    .select("-__v")
    .sort("nom");

  res.send(foods);
});

router.get("/:id", async (req, res) => {
  const food = await Food.findById(req.params.id).select("-__v");
  if (!food) return res.status(404).send("food avec cette id n'existe pas");
  res.send(food);
});

router.post("/", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${err}`,
    });
  }

  // never tested
  if (req.files == undefined) {
    return res.status(400).send({ message: "Please upload multiple images!" });
  }
  const { error } = validations.food(req.body);
  if (error) {
    deleteImages(req.files);
    return res.status(400).send(error.details[0].message);
  }

  const { image: images } = getPathData(req.files);
  const { nom, description, prix, restaurantId } = req.body;

  if (restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non trouvé.");
    }
  }

  const food = new Food({
    nom: nom,
    images: images ? images.map((file) => file.path) : [],
    description: description,
    prix: prix,
    restaurantId: restaurantId,
  });
  await food.save();
  res.send(food);
});

router.put("/:id", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${error}`,
    });
  }

  const { error } = validations.food(req.body);
  if (error) {
    deleteImages(req.files);
    return res.status(400).send(error.details[0].message);
  }

  const { image: images } = getPathData(req.files);
  const { nom, description, prix, restaurantId } = req.body;

  if (restaurantId) {
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if (!restaurant) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non trouvé.");
    }
  }
  const food = await Food.findOne({ _id: req.params.id });
  if (!food) {
    deleteImages(req.files);
    return res.status(404).send("food avec cet id n'existe pas");
  }

  if (images) food.images.push(...images.map((file) => file.path));

  food.nom = nom;
  food.description = description;
  food.prix = prix;
  food.restaurantId = restaurantId;

  await food.save();

  // verifier si necessaire ou nn
  if (!food) return res.status(404).send("food avec cette id n'existe pas");

  res.send(food);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const food = await Food.findById(req.params.id).select("-__v");

  if (!food) return res.status(404).send("food avec cet id n'existe pas");
});

router.delete("/:id", auth, async (req, res) => {
  const food = await Food.findByIdAndRemove(req.params.id);
  if (food && food.images) deleteImages(food.images);
  if (!food) return res.status(404).send("food avec cette id n'existe pas");
  res.send(food);
});

module.exports = router;
