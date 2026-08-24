const express = require("express");

const router = express.Router();

const concertController = require("../controllers/concertController");

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