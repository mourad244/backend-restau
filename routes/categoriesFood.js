const { CategorieFood } = require("../models/categorieFood");
const auth = require("../middleware/auth");
const express = require("express");
const uploadImages = require("../middleware/uploadImages");
const deleteImages = require("../middleware/deleteImages");
const getPathData = require("../middleware/getPathData");
const { Restaurant } = require("../models/restaurant");
const validations = require("../startup/validations");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const validateObjectId = require("../middleware/validateObjectId");

router.get("/", auth, async (req, res) => {
  const categoriesFood = await CategorieFood.find()
    .populate("restaurantsId", "nom")
    .select("-__v")
    .sort("nom");
  res.send(categoriesFood);
});

router.get("/:id", auth, async (req, res) => {
  const categorieFood = await CategorieFood.findById(req.params.id).select(
    "-__v"
  );
  if (!categorieFood) return res.status(404).send("rendez vous n'existe pas");
  res.send(categorieFood);
});

router.post("/", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${err}`,
    });
  }

  if (req.files == undefined) {
    return res.status(400).send({ message: "Please upload multiple images!" });
  }

  const { error } = validations.categorieFood(req.body);
  if (error) {
    deleteImages(req.files);
    return res.status(400).send(error.details[0].message);
  }

  const { image: images } = getPathData(req.files);
  const { nom, restaurantsId } = req.body;

  if (restaurantsId) {
    const restaurant = await Restaurant.find({
      _id: { $in: restaurantsId },
    });
    if (restaurant.length == 0) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non trouvé.");
    }
  }

  const categorieFood = new CategorieFood({
    nom: nom,
    images: images ? images.map((file) => file.path) : [],
    restaurantsId: restaurantsId,
  });
  await categorieFood.save();
  res.send(categorieFood);
});

router.put("/:id", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
    const { error } = validations.categorieFood(req.body);
    if (error) {
      deleteImages(req.files);
      return res.status(400).send(error.details[0].message);
    }

    const restaurant = await Restaurant.findById(req.body.restaurantsId);
    if (!restaurant) {
      deleteImages(req.files);
      return res.status(400).send("id restaurant non valide.");
    }

    const categorieFood = await CategorieFood.findOne({ _id: req.params.id });
    if (req.files) {
      fs.unlinkSync(categorieFood.images);
      categorieFood.images = req.file.path;
    }

    const { nom, restaurantsId } = req.body;

    categorieFood.nom = nom;
    categorieFood.restaurantsId = restaurantsId;

    await categorieFood.save();

    if (!categorieFood)
      return res.status(404).send("rendez vous avec cet id n'existe pas");

    res.send(categorieFood);
  } catch (error) {}
});

router.get("/:id", validateObjectId, auth, async (req, res) => {
  const categorieFood = await CategorieFood.findById(req.params.id).select(
    "-__v"
  );

  if (!categorieFood)
    return res.status(404).send("categorieFood avec cet id n'existe pas");
});

router.delete("/:id", auth, async (req, res) => {
  const categorieFood = await CategorieFood.findByIdAndRemove(req.params.id);
  fs.unlinkSync(categorieFood.images);

  if (!categorieFood)
    return res.status(404).send("categorieFood avec cette id n'existe pas");
});

module.exports = router;
