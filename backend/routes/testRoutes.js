const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) throw error;

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get(
  "/admin",
  verifyToken,
  checkRole("admin", "super_admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Selamat datang Admin",
      user: req.user,
    });
  }
);

module.exports = router;