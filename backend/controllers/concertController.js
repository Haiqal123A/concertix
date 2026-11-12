const supabase = require("../config/supabase");
const { randomUUID } = require("crypto");

const posterBucket = "concert-posters";
const posterExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const getJakartaDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const addConcertDisplayStatus = async (concerts) => {
  if (concerts.length === 0) return concerts;

  const concertIds = concerts.map((concert) => concert.id);
  const { data: ticketTypes, error } = await supabase
    .from("ticket_types")
    .select("concert_id, stock, sold, reserved")
    .in("concert_id", concertIds);

  if (error) throw error;

  const ticketsByConcert = new Map();
  for (const ticket of ticketTypes || []) {
    const tickets = ticketsByConcert.get(ticket.concert_id) || [];
    tickets.push(ticket);
    ticketsByConcert.set(ticket.concert_id, tickets);
  }

  const today = getJakartaDate();
  return concerts
    .map((concert) => {
      const configuredStatus = concert.status || "upcoming";
      const tickets = ticketsByConcert.get(concert.id) || [];
      const isSoldOut =
        tickets.length > 0 &&
        tickets.every(
          (ticket) =>
            Number(ticket.stock || 0) -
              Number(ticket.sold || 0) -
              Number(ticket.reserved || 0) <=
            0
        );

      let status = "upcoming";
      if (configuredStatus === "cancelled") {
        status = "cancelled";
      } else if (concert.concert_date < today) {
        status = "finished";
      } else if (concert.concert_date === today) {
        status = "ongoing";
      } else if (isSoldOut) {
        status = "sold_out";
      }

      return {
        ...concert,
        artist_count: String(
          concert.artist_names || concert.artists?.name || ""
        )
          .split(/[,\n;]+/)
          .filter((name) => name.trim()).length,
        configured_status: configuredStatus,
        status,
      };
    })
    .sort((a, b) => {
      const rank = {
        upcoming: 0,
        ongoing: 1,
        sold_out: 2,
        cancelled: 3,
        finished: 4,
      };
      const statusDifference =
        (rank[a.status] ?? 5) - (rank[b.status] ?? 5);

      if (statusDifference !== 0) return statusDifference;

      const dateDifference = String(a.concert_date || "").localeCompare(
        String(b.concert_date || "")
      );
      return a.status === "finished" || a.status === "cancelled"
        ? -dateDifference
        : dateDifference;
    });
};

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

    const concerts = await addConcertDisplayStatus(data);

    res.json({
      success: true,
      total: concerts.length,
      data: concerts,
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

    const [concert] = await addConcertDisplayStatus([data]);

    res.json({
      success: true,
      data: concert,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadPoster = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Pilih file poster berformat JPG, PNG, atau WebP.",
    });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({
      success: false,
      message: "Upload poster belum dikonfigurasi di server.",
    });
  }

  try {
    const extension = posterExtensions[req.file.mimetype];
    const filePath = `${randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage
      .from(posterBucket)
      .upload(filePath, req.file.buffer, {
        cacheControl: "31536000",
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from(posterBucket)
      .getPublicUrl(data.path);

    res.status(201).json({
      success: true,
      data: { url: publicUrl.publicUrl },
    });
  } catch (err) {
    console.error("UPLOAD CONCERT POSTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengunggah poster.",
    });
  }
};

// POST konser
exports.createConcert = async (req, res) => {
  try {
    const {
      category_id,
      artist_names,
      venue_address,
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
          artist_id: null,
          artist_names: artist_names?.trim() || null,
          venue_id: null,
          venue_address: venue_address?.trim() || null,
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
      artist_names,
      venue_address,
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
        artist_id: null,
        artist_names: artist_names?.trim() || null,
        venue_id: null,
        venue_address: venue_address?.trim() || null,
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
