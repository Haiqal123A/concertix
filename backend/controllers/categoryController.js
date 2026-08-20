const Category = require("../models/categoryModel");

// ======================
// GET ALL
// ======================
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.getAll();

    res.json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// GET BY ID
// ======================
exports.getById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// CREATE
// ======================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.create({
      name,
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// UPDATE
// ======================
exports.update = async (req, res) => {
  try {
    const category = await Category.update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// DELETE
// ======================
exports.remove = async (req, res) => {
  try {
    await Category.remove(req.params.id);

    res.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};