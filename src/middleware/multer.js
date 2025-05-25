const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer storage config for profileImage only
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname !== "profileImage") {
      return cb(new Error("Invalid fieldname"));
    }
    const uploadPath = path.join(__dirname, "../../public/profileImage");

    // Create folder if not exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    // Set filename like: profileImage_1684971234567.jpg
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Allowed file extensions for images and docs
const allowedFileTypes = /\.(png|jpg|jpeg|doc|docx|pdf|txt|xls|xlsx|ppt|pptx)$/i;


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
