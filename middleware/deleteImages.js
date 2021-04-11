const fs = require("fs");

module.exports = deleteImages = (files) => {
  if (typeof files != Array) console.log("done");
  files.map((image) => {
    fs.unlinkSync(image);
  });
};
