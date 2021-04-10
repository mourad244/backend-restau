const util = require("util");
const path = require("path");
const multer = require("multer");
const maxsize = 2 * 1024 * 1024;

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e2) +
        path.extname(file.originalname)
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadImages = multer({
  storage: storage,
  limits: maxsize,
  fileFilter: fileFilter,
});
// .fields([
//   { name: "image", maxCount: 4 },
//   { name: "accessoire", maxCount: 4 },
// ]);
// .array("image" || "accessoire", 10);

const uploadImagesMiddleware = util.promisify(
  uploadImages.fields([{ name: "image" }, { name: "accessoire" }])
);
module.exports = uploadImagesMiddleware;
