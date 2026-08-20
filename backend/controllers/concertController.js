const supabase = require("../config/supabase");

// GET semua konser
exports.getAllConcerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("concerts")
      .select(`
        *,
        categories (
          id,
          name
        ),
        artists (
          id,
          name
        ),
        venues (
          id,
          name,
          city,
          address
        )
      `)
      .order("concert_date", { ascending: true });

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
};

// GET konser berdasarkan ID
exports.getConcertById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("concerts")
      .select(`
        *,
        categories (
          id,
          name
        ),
        artists (
          id,
          name
        ),
        venues (
          id,
          name,
          city,
          address
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// POST konser
exports.createConcert = async (req, res) => {
  try {
    const {
      category_id,
      artist_id,
      venue_id,
      title,
      poster,
      description,
      concert_date,
      concert_time,
      status,
    } = req.body;

    const { data, error } = await supabase
      .from("concerts")
      .insert([
        {
          category_id,
          artist_id,
          venue_id,
          title,
          poster,
          description,
          concert_date,
          concert_time,
          status: status || "upcoming",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Concert berhasil ditambahkan",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT konser
exports.updateConcert = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      artist_id,
      venue_id,
      title,
      poster,
      description,
      concert_date,
      concert_time,
      status,
    } = req.body;

    const { data, error } = await supabase
      .from("concerts")
      .update({
        category_id,
        artist_id,
        venue_id,
        title,
        poster,
        description,
        concert_date,
        concert_time,
        status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Concert berhasil diperbarui",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE konser
exports.deleteConcert = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("concerts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Concert berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

