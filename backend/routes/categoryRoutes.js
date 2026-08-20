const express = require("express");
const router = express.Router();

const CategoryController = require("../controllers/categoryController");
const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// Public
router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);

// Admin & Super Admin
router.post(
  "/",
  verifyToken,
  checkRole("admin", "super_admin"),
  CategoryController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  CategoryController.update
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  CategoryController.remove
);

module.exports = router;