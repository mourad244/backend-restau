const fs = require("fs");

module.exports = deleteImages = (files) => {
  if (!Array.isArray(files)) {
    if (typeof files == "string") {
      try {
        fs.unlinkSync(files);
      } catch (error) {
        return error;
      }
    } else
      for (let item in files) {
        files[item].map((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            return error;
          }
        });
      }
  }
  if (Array.isArray(files))
    files.map((image) => {
      try {
        fs.unlinkSync(image);
      } catch (error) {
        return error;
      }
    });
};
