const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Always resolve to <backend-root>/uploads regardless of where the
// process was launched from (this used to be a relative "uploads/" path,
// which broke if the server was started from a different working directory
// than the backend folder — files got written to the wrong place and the
// static file server could never find them).
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Make sure the folder actually exists before multer tries to write into it.
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }

    },

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

module.exports = upload;
