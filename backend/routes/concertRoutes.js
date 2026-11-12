const express = require("express");
const multer = require("multer");

const router = express.Router();

const concertController = require("../controllers/concertController");

const uploadPosterFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Format poster tidak didukung."));
  },
}).single("poster");

const handlePosterUpload = (req, res, next) => {
  uploadPosterFile(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const isTooLarge =
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE";
    res.status(isTooLarge ? 413 : 400).json({
      success: false,
      message: isTooLarge
        ? "Ukuran poster maksimal 4 MB."
        : error.message,
    });
  });
};

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// =========================
// PUBLIC
// =========================

// GET semua concert
router.get("/", concertController.getAllConcerts);

// GET concert berdasarkan ID
router.get("/:id", concertController.getConcertById);

router.post(
  "/poster",
  verifyToken,
  checkRole("admin", "super_admin"),
  handlePosterUpload,
  concertController.uploadPoster
);

// =========================
// ADMIN & SUPER ADMIN
// =========================

// POST concert
router.post(
  "/",
  verifyToken,
  checkRole("admin", "super_admin"),
  concertController.createConcert
);

// PUT concert
router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  concertController.updateConcert
);

// DELETE concert
router.delete(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  concertController.deleteConcert
);

module.exports = router;