const fs = require("fs");

module.exports = deleteImages = (files) => {
  if (!Array.isArray(files)) {
    for (let item in files) {
      files[item].map((file) => fs.unlinkSync(file.path));
    }
  }
  if (Array.isArray(files))
    files.map((image) => {
      fs.unlinkSync(image);
    });
};
