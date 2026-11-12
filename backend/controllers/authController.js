const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Auth = require("../models/authModel");

const getStaffDatabaseMessage = (err) => {
  const message = String(err.message || "");
  const descriptionColumnMissing =
    /description/i.test(message) &&
    /(does not exist|could not find|schema cache|not found)/i.test(message);

  return descriptionColumnMissing
    ? "Kolom public.users.description belum tersedia. Jalankan migrasi 20261112_staff_account_management.sql di Supabase."
    : null;
};

// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi",
      });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password);

    if (!trimmedName || !normalizedEmail || trimmedPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid. Password minimal 6 karakter.",
      });
    }

    const existingUser = await Auth.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const user = await Auth.createUser({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
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
    console.error("REGISTER_ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Register gagal",
    });
  }
};

// ======================
// CREATE STAFF ACCOUNT
// ======================
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const description = String(req.body.description || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi",
      });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password);

    if (
      !trimmedName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      trimmedPassword.length < 6 ||
      description.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak valid. Password minimal 6 karakter dan keterangan maksimal 500 karakter.",
      });
    }

    const existingUser = await Auth.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = await Auth.createUser({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "petugas",
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "Akun petugas berhasil dibuat",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    console.error("CREATE_STAFF_ERROR:", err);
    return res.status(500).json({
      success: false,
      message: getStaffDatabaseMessage(err) || "Gagal membuat akun petugas",
    });
  }
};

exports.listStaff = async (_req, res) => {
  try {
    const staff = await Auth.listStaff();

    return res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    console.error("GET STAFF ERROR:", err);
    return res.status(500).json({
      success: false,
      message:
        getStaffDatabaseMessage(err) || "Gagal mengambil daftar petugas",
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const description = String(req.body.description || "").trim();
    const trimmedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const hasPassword = password !== undefined && String(password).length > 0;
    const trimmedPassword = hasPassword ? String(password) : "";

    if (
      !/^\d+$/.test(id) ||
      !trimmedName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      (hasPassword && trimmedPassword.length < 6) ||
      description.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak valid. Password baru minimal 6 karakter dan keterangan maksimal 500 karakter.",
      });
    }

    const existingUser = await Auth.findUserByEmail(normalizedEmail);
    if (existingUser && String(existingUser.id) !== id) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const fields = {
      name: trimmedName,
      email: normalizedEmail,
      description: description || null,
    };

    if (hasPassword) {
      fields.password = await bcrypt.hash(trimmedPassword, 10);
    }

    const user = await Auth.updateStaff(id, fields);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun petugas tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Akun petugas berhasil diperbarui",
      data: user,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    console.error("UPDATE STAFF ERROR:", err);
    return res.status(500).json({
      success: false,
      message:
        getStaffDatabaseMessage(err) || "Gagal memperbarui akun petugas",
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID petugas tidak valid",
      });
    }

    const deletedUser = await Auth.deleteStaff(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Akun petugas tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Akun petugas berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE STAFF ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus akun petugas",
    });
  }
};

// ======================
// LOGIN
// ======================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Auth.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        description: user.description || "",
      },
    });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil akun.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await Auth.findUserByEmail(normalizedEmail);

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
        description: user.description || "",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};