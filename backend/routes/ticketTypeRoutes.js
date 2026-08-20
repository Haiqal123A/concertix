const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

// GET semua ticket types
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ticket_types")
      .select(`
        *,
        concerts (
          id,
          title,
          concert_date,
          concert_time
        )
      `)
      .order("id", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      message: "Data ticket type berhasil diambil",
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

// GET ticket type berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("ticket_types")
      .select(`
        *,
        concerts (
          id,
          title,
          concert_date,
          concert_time
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Ticket type berhasil ditemukan",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// POST ticket type
router.post("/", async (req, res) => {
  try {
    const {
      concert_id,
      name,
      price,
      stock,
    } = req.body;

    if (!concert_id || !name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "concert_id, name, price, dan stock wajib diisi",
      });
    }

    const { data, error } = await supabase
      .from("ticket_types")
      .insert([
        {
          concert_id,
          name,
          price,
          stock,
          sold: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Ticket type berhasil ditambahkan",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// PUT ticket type
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      concert_id,
      name,
      price,
      stock,
    } = req.body;

    const { data, error } = await supabase
      .from("ticket_types")
      .update({
        concert_id,
        name,
        price,
        stock,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Ticket type berhasil diperbarui",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE ticket type
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("ticket_types")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Ticket type berhasil dihapus",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;