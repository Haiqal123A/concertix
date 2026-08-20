const Venue = require("../models/venueModel");

exports.getAll = async (req, res) => {
  try {
    const venues = await Venue.getAll();

    res.json({
      success: true,
      message: "Data venue berhasil diambil",
      total: venues.length,
      data: venues,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const venue = await Venue.getById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Data venue berhasil diambil",
      data: venue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const body = req.body || {};

    const name = body.name;
    const city = body.city;
    const address = body.address;
    const image = body.image || null;

    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: "name, city, dan address wajib diisi",
      });
    }

    const venue = await Venue.create({
      name,
      city,
      address,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Venue berhasil ditambahkan",
      data: venue,
    });
  } catch (err) {
    console.error("CREATE VENUE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const existingVenue = await Venue.getById(req.params.id);

    if (!existingVenue) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    const body = req.body || {};

    const venue = await Venue.update(req.params.id, {
      name: body.name,
      city: body.city,
      address: body.address,
      image: body.image || null,
    });

    res.json({
      success: true,
      message: "Venue berhasil diperbarui",
      data: venue,
    });
  } catch (err) {
    console.error("UPDATE VENUE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const existingVenue = await Venue.getById(req.params.id);

    if (!existingVenue) {
      return res.status(404).json({
        success: false,
        message: "Venue tidak ditemukan",
      });
    }

    await Venue.remove(req.params.id);

    res.json({
      success: true,
      message: "Venue berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE VENUE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};