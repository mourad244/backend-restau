const logger = require("../startup/logging");
const mongoose = require("mongoose");
const config = require("config");

require("dotenv").config();

module.exports = function () {
  mongoose
    .connect(process.env.MONGODB_URI || config.get("db"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => logger.info("Connected to MongoDB..."));
};
