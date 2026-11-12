const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// Register
router.post("/register", AuthController.register);

router.post(
  "/staff",
  verifyToken,
  checkRole("admin", "super_admin"),
  AuthController.createStaff
);

router.get(
  "/staff",
  verifyToken,
  checkRole("admin", "super_admin"),
  AuthController.listStaff
);

router.put(
  "/staff/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  AuthController.updateStaff
);

router.delete(
  "/staff/:id",
  verifyToken,
  checkRole("admin", "super_admin"),
  AuthController.deleteStaff
);

// Login
router.post("/login", AuthController.login);
router.get("/me", verifyToken, AuthController.getCurrentUser);

module.exports = router;