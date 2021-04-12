const express = require("express");
const restaurants = require("../routes/restaurants");
const foods = require("../routes/foods");
const users = require("../routes/users");
const categoriesFood = require("../routes/categoriesFood");
const auth = require("../routes/auth");
const error = require("../middleware/error");
const cors = require("cors");
var bodyParser = require("body-parser");

module.exports = function (app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/restauapi/restaurants", restaurants);
  app.use("/restauapi/categoriesfood", categoriesFood);
  app.use("/restauapi/foods", foods);
  app.use("/restauapi/users", users);
  app.use("/rstauapi/auth", auth);
  app.use(error);
};
