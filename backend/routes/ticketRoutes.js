const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const maxPosterBytes = 5 * 1024 * 1024;
const allowedPosterHosts = new Set([
  "statik.tempo.co",
  "i.pinimg.com",
  new URL(process.env.SUPABASE_URL).hostname,
]);
const allowedPosterTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const getAllowedPosterUrl = (value) => {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.port ||
      url.username ||
      url.password ||
      !allowedPosterHosts.has(url.hostname.toLowerCase())
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

const fetchPoster = async (url) => {
  let currentUrl = url;

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    const location = response.headers.get("location");
    const redirectedUrl = location
      ? getAllowedPosterUrl(new URL(location, currentUrl).href)
      : null;

    if (!redirectedUrl) {
      throw new Error("Poster redirect is not allowed.");
    }

    currentUrl = redirectedUrl;
  }

  throw new Error("Poster has too many redirects.");
};

const requireActiveStaff = async (req, res, next) => {
  if (req.user.role !== "petugas") return next();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", req.user.id)
      .eq("role", "petugas")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(401).json({
        success: false,
        message: "Akun petugas sudah tidak aktif",
      });
    }

    return next();
  } catch (err) {
    console.error("VERIFY TICKET STAFF ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memverifikasi akun petugas",
    });
  }
};

router.get("/poster-image", async (req, res) => {
  const posterUrl = getAllowedPosterUrl(req.query.url);
  if (!posterUrl) {
    return res.status(400).json({
      success: false,
      message: "URL poster tidak didukung.",
    });
  }

  try {
    const response = await fetchPoster(posterUrl);
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Poster konser tidak dapat dimuat.",
      });
    }

    const contentType = response.headers
      .get("content-type")
      ?.split(";")[0]
      .toLowerCase();
    if (!allowedPosterTypes.has(contentType)) {
      return res.status(415).json({
        success: false,
        message: "Format poster tidak didukung.",
      });
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxPosterBytes) {
      return res.status(413).json({
        success: false,
        message: "Ukuran poster melebihi batas.",
      });
    }

    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of response.body) {
      totalBytes += chunk.length;
      if (totalBytes > maxPosterBytes) {
        return res.status(413).json({
          success: false,
          message: "Ukuran poster melebihi batas.",
        });
      }
      chunks.push(chunk);
    }

    if (totalBytes === 0) {
      return res.status(502).json({
        success: false,
        message: "Poster konser tidak dapat dimuat.",
      });
    }

    res.set({
      "Cache-Control": "public, max-age=3600",
      "Content-Length": String(totalBytes),
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });
    return res.send(Buffer.concat(chunks));
  } catch (err) {
    console.error("TICKET POSTER PROXY ERROR:", err);
    return res.status(502).json({
      success: false,
      message: "Gagal memuat poster tiket.",
    });
  }
});

router.post(
  "/scan",
  verifyToken,
  checkRole("admin", "super_admin", "petugas"),
  requireActiveStaff,
  async (req, res) => {
    try {
      const ticketCode =
        typeof req.body.ticket_code === "string"
          ? req.body.ticket_code.trim()
          : "";

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          ticketCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "QR tiket tidak valid.",
        });
      }

      const { data: result, error: consumeError } = await supabase.rpc(
        "consume_concert_ticket",
        {
          p_ticket_code: ticketCode,
          p_admin_id: Number(req.user.id),
        }
      );

      if (consumeError) throw consumeError;

      if (result.state === "invalid") {
        return res.status(404).json({
          success: false,
          data: { state: "invalid" },
          message: "Tiket tidak valid atau pembayarannya belum berhasil.",
        });
      }

      if (result.state === "already_used") {
        return res.status(409).json({
          success: false,
          data: result,
          message: "Tiket ini sudah pernah dipindai untuk masuk.",
        });
      }

      const { data: ticket, error: ticketError } = await supabase
        .from("concert_tickets")
        .select(`
          id,
          order_id,
          attendee_number,
          checked_in_at,
          order_items (
            ticket_types (
              name,
              concerts (
                id,
                title,
                concert_date,
                concert_time,
                venue_address,
                venues (
                  name,
                  city
                )
              )
            )
          ),
          orders (
            customer_name,
            customer_email,
            concert_order_numbers (
              concert_id,
              order_number
            )
          )
        `)
        .eq("id", result.ticket_id)
        .single();

      if (ticketError) throw ticketError;

      return res.json({
        success: true,
        data: {
          ...result,
          ticket,
        },
        message: "Tiket valid. Silakan persilakan masuk.",
      });
    } catch (err) {
      console.error("TICKET SCAN ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal memvalidasi tiket.",
      });
    }
  }
);

module.exports = router;
