const express = require("express");
const router = express.Router();

const VenueController = require("../controllers/venueController");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// Public
router.get("/", VenueController.getAll);
router.get("/:id", VenueController.getById);

// Admin & Super Admin
router.post(
  "/",
  verifyToken,
  checkRole("admin", "super_admin"),
  VenueController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  VenueController.update
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  VenueController.remove
);

module.exports = router;