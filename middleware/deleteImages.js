const fs = require("fs");

module.exports = deleteImages = (files) => {
  files.map((image) => {
    fs.unlinkSync(image);
  });
};
