const express = require("express");
const router = express.Router();

const ArtistController = require("../controllers/artistController");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// Public
router.get("/", ArtistController.getAll);
router.get("/:id", ArtistController.getById);

// Admin & Super Admin
router.post(
  "/",
  verifyToken,
  checkRole("admin", "super_admin"),
  ArtistController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  ArtistController.update
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  ArtistController.remove
);

module.exports = router;