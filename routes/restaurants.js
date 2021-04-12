const { Restaurant } = require("../models/restaurant");
const auth = require("../middleware/auth");
const express = require("express");
const uploadImages = require("../middleware/uploadImages");
const deleteImages = require("../middleware/deleteImages");
const { CategorieFood } = require("../models/categorieFood");
const validations = require("../startup/validations");
const getPathData = require("../middleware/getPathData");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const _ = require("lodash");

const validateObjectId = require("../middleware/validateObjectId");

router.get("/", auth, async (req, res) => {
  const restaurants = await Restaurant.find().select("-__v").sort("nom");
  res.send(restaurants);
});

router.get("/:id", auth, async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).select("-__v");
  if (!restaurant) return res.status(404).send("restaurant n'existe pas");
  res.send(restaurant);
});

router.post("/", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${error}`,
    });
  }

  if (req.files == undefined) {
    return res.status(400).send({ message: "Please upload multiple images!" });
  }

  const { error } = validations.restaurant(req.body);
  if (error) {
    deleteImages(req.files);
    return res.status(400).send(error.details[0].message);
  }

  // get path from uploaded data

  const { image: images } = getPathData(req.files);
  const {
    nom,
    description,
    h_ouverture,
    h_fermeture,
    telephone,
    latitude,
    longitude,
    categorieFoodsId,
  } = req.body;

  // to comments if a another fonction verifies its existance before
  if (categorieFoodsId) {
    const categorieFood = await CategorieFood.find({
      _id: { $in: categorieFoodsId },
    });

    if (categorieFood.length == 0) {
      deleteImages(req.files);
      return res.status(400).send("id categorieFood non trouvé.");
    }
  }

  const restaurant = new Restaurant({
    nom: nom,
    images: images ? images.map((file) => file.path) : [],
    description: description,
    h_ouverture: h_ouverture,
    h_fermeture: h_fermeture,
    telephone: telephone,
    latitude: latitude,
    longitude: longitude,
    categorieFoodsId: categorieFoodsId,
  });
  await restaurant.save();
  res.send(restaurant);
});

router.put("/:id", auth, async (req, res) => {
  try {
    await uploadImages(req, res);
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the images: ${req.files.originalname}. ${error}`,
    });
  }

  const { error } = validations.restaurant(req.body);
  if (error) {
    deleteImages(req.files);
    return res.status(400).send(error.details[0].message);
  }

  const { image: images } = getPathData(req.files);
  const {
    nom,
    description,
    h_ouverture,
    h_fermeture,
    telephone,
    latitude,
    longitude,
    categorieFoodsId,
  } = req.body;

  // to comments if a another fonction verifies its existance before
  if (categorieFoodsId) {
    const categorieFood = await CategorieFood.find({
      _id: { $in: categorieFoodsId },
    });

    if (categorieFood.length == 0) {
      deleteImages(req.files);
      return res.status(400).send("id categorieFood non trouvé.");
    }
  }

  const restaurant = await Restaurant.findOne({ _id: req.params.id });
  if (!restaurant) {
    deleteImages(req.files);
    return res.status(400).send("restaurant with this id not found");
  }

  if (images) restaurant.images.push(...images.map((file) => file.path));

  restaurant.nom = nom;
  restaurant.description = description;
  restaurant.h_ouverture = h_ouverture;
  restaurant.h_fermeture = h_fermeture;
  restaurant.telephone = telephone;
  restaurant.latitude = latitude;
  restaurant.longitude = longitude;
  restaurant.categorieFoodsId = categorieFoodsId;

  await restaurant.save();

  if (!restaurant)
    return res.status(404).send("restaurant avec cet id n'existe pas");

  res.send(restaurant);
});

router.get("/:id", validateObjectId, auth, async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).select("-__v");

  if (!restaurant)
    return res.status(404).send("restaurant avec cet id n'existe pas");
});

router.delete("/:id", auth, async (req, res) => {
  const restaurant = await Restaurant.findByIdAndRemove(req.params.id);
  if (restaurant && restaurant.images) deleteImages(restaurant.images);
  if (!restaurant)
    return res.status(404).send("restaurant avec cette id n'existe pas");
  res.send(restaurant);
});

module.exports = router;
