const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.post(
  "/scan",
  verifyToken,
  checkRole("admin", "super_admin"),
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
                title,
                concert_date,
                concert_time,
                venues (
                  name,
                  city
                )
              )
            )
          ),
          orders (
            customer_name,
            customer_email
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
