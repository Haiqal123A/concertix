const Artist = require("../models/artistModel");

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const artists = await Artist.getAll();

    res.json({
      success: true,
      message: "Data artist berhasil diambil",
      total: artists.length,
      data: artists,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const artist = await Artist.getById(req.params.id);

    res.json({
      success: true,
      message: "Data artist berhasil diambil",
      data: artist,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Artist tidak ditemukan",
    });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, image, description } = req.body;

    const artist = await Artist.create({
      name,
      image,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Artist berhasil ditambahkan",
      data: artist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, image, description } = req.body;

    const artist = await Artist.update(req.params.id, {
      name,
      image,
      description,
    });

    res.json({
      success: true,
      message: "Artist berhasil diperbarui",
      data: artist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    await Artist.remove(req.params.id);

    res.json({
      success: true,
      message: "Artist berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};