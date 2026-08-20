const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Auth = require("../models/authModel");

// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Cek email
    const existingUser = await Auth.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    const user = await Auth.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "Register berhasil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user
    const user = await Auth.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    // Cek password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};