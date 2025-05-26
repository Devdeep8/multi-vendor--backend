const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer storage config for profileImage only
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    if (file.fieldname === "profileImage") {
      uploadPath = path.join(__dirname, "../../public/profileImage");
    } else if (file.fieldname === "ProductPhotos") {
      uploadPath = path.join(__dirname, "../../public/ProductPhotos");
    } else {
      return cb(new Error("Invalid fieldname"));
    }

    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});


// Allowed file extensions for images and docs
const allowedFileTypes = /\.(png|jpg|jpeg|webp|gif|bmp|svg|doc|docx|pdf|txt|xls|xlsx|ppt|pptx)$/i;


const uploads = multer({
  storage: fileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(allowedFileTypes)) {
      return cb(new Error("Please upload an image or document with valid formats."));
    }
    cb(null, true);
  },
});

module.exports = {
  uploads,
};
