const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// =====================================================
// POST /api/payments
// User membuat payment
// =====================================================
router.post(
  "/",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      const user_id = req.user.id;

      const {
        order_id,
        payment_method,
        payment_proof,
      } = req.body;

      // ===============================
      // VALIDASI
      // ===============================
      if (!order_id || !payment_method) {
        return res.status(400).json({
          success: false,
          message: "order_id dan payment_method wajib diisi",
        });
      }

      // ===============================
      // CEK ORDER
      // ===============================
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", user_id)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan",
        });
      }

      // ===============================
      // CEK SUDAH DIBAYAR
      // ===============================
      if (order.payment_status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Order ini sudah dibayar",
        });
      }

      // ===============================
      // CEK PAYMENT SEBELUMNYA
      // ===============================
      const {
        data: existingPayment,
        error: existingPaymentError,
      } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", order_id)
        .maybeSingle();

      if (existingPaymentError) {
        throw existingPaymentError;
      }

      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment untuk order ini sudah dibuat",
          data: existingPayment,
        });
      }

      // ===============================
      // BUAT PAYMENT
      // ===============================
      const {
        data: payment,
        error: paymentError,
      } = await supabase
        .from("payments")
        .insert({
          order_id,
          payment_method,
          payment_proof: payment_proof || null,
          payment_date: new Date().toISOString(),
          status: "pending",
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // ===============================
      // UPDATE ORDER
      // ===============================
      const {
        data: updatedOrder,
        error: updateOrderError,
      } = await supabase
        .from("orders")
        .update({
          payment_status: "pending",
        })
        .eq("id", order_id)
        .select()
        .single();

      if (updateOrderError) {
        throw updateOrderError;
      }

      // ===============================
      // RESPONSE
      // ===============================
      res.status(201).json({
        success: true,
        message: "Payment berhasil dibuat dan menunggu verifikasi",
        data: {
          payment,
          order: updatedOrder,
        },
      });
    } catch (err) {
      console.error("PAYMENT ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// GET /api/payments
// User melihat payment miliknya
// =====================================================
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        orders (
          id,
          user_id,
          total_price,
          status,
          payment_status,
          created_at
        )
      `)
      .eq("orders.user_id", user_id)
      .order("payment_date", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "Data payment berhasil diambil",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("GET PAYMENT ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// GET /api/payments/admin
// Admin melihat semua payment
// =====================================================
router.get(
  "/admin",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          orders (
            id,
            user_id,
            total_price,
            status,
            payment_status,
            created_at,
            users (
              id,
              name,
              email
            )
          )
        `)
        .order("payment_date", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: "Data payment berhasil diambil",
        total: data.length,
        data,
      });
    } catch (err) {
      console.error("GET ADMIN PAYMENT ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// PATCH /api/payments/:id/verify
// Admin menyetujui payment
// =====================================================
router.patch(
  "/:id/verify",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const payment_id = req.params.id;

      // ===============================
      // CARI PAYMENT
      // ===============================
      const {
        data: payment,
        error: paymentError,
      } = await supabase
        .from("payments")
        .select("*")
        .eq("id", payment_id)
        .single();

      if (paymentError || !payment) {
        return res.status(404).json({
          success: false,
          message: "Payment tidak ditemukan",
        });
      }

      // ===============================
      // CEK STATUS PAYMENT
      // ===============================
      if (payment.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Payment ini sudah diverifikasi",
        });
      }

      if (payment.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Payment ini sudah ditolak",
        });
      }

      // ===============================
      // AMBIL ORDER ITEMS
      // ===============================
      const {
        data: orderItems,
        error: orderItemsError,
      } = await supabase
        .from("order_items")
        .select(`
          ticket_type_id,
          quantity
        `)
        .eq("order_id", payment.order_id);

      if (orderItemsError) {
        throw orderItemsError;
      }

      if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Order tidak memiliki tiket",
        });
      }

      // ===============================
      // CEK STOK TERLEBIH DAHULU
      // ===============================
      for (const item of orderItems) {
        const {
          data: ticket,
          error: ticketError,
        } = await supabase
          .from("ticket_types")
          .select("id, name, stock, sold")
          .eq("id", item.ticket_type_id)
          .single();

        if (ticketError || !ticket) {
          return res.status(404).json({
            success: false,
            message: `Ticket type ${item.ticket_type_id} tidak ditemukan`,
          });
        }

        const availableStock =
          Number(ticket.stock) - Number(ticket.sold);

        if (availableStock < Number(item.quantity)) {
          return res.status(400).json({
            success: false,
            message: `Stok tiket ${ticket.name} tidak mencukupi`,
          });
        }
      }

      // ===============================
      // UPDATE SOLD
      // ===============================
      for (const item of orderItems) {
        const {
          data: ticket,
          error: ticketError,
        } = await supabase
          .from("ticket_types")
          .select("sold")
          .eq("id", item.ticket_type_id)
          .single();

        if (ticketError || !ticket) {
          throw ticketError || new Error("Ticket tidak ditemukan");
        }

        const newSold =
          Number(ticket.sold) + Number(item.quantity);

        const {
          error: updateSoldError,
        } = await supabase
          .from("ticket_types")
          .update({
            sold: newSold,
          })
          .eq("id", item.ticket_type_id);

        if (updateSoldError) {
          throw updateSoldError;
        }
      }

      // ===============================
      // UPDATE PAYMENT
      // ===============================
      const {
        data: updatedPayment,
        error: updatePaymentError,
      } = await supabase
        .from("payments")
        .update({
          status: "paid",
          payment_date: new Date().toISOString(),
        })
        .eq("id", payment_id)
        .select()
        .single();

      if (updatePaymentError) {
        throw updatePaymentError;
      }

      // ===============================
      // UPDATE ORDER
      // ===============================
      const {
        data: updatedOrder,
        error: updateOrderError,
      } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", payment.order_id)
        .select()
        .single();

      if (updateOrderError) {
        throw updateOrderError;
      }

      // ===============================
      // RESPONSE
      // ===============================
      res.json({
        success: true,
        message: "Payment berhasil diverifikasi",
        data: {
          payment: updatedPayment,
          order: updatedOrder,
        },
      });
    } catch (err) {
      console.error("VERIFY PAYMENT ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// PATCH /api/payments/:id/reject
// Admin menolak payment
// =====================================================
router.patch(
  "/:id/reject",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const payment_id = req.params.id;

      // ===============================
      // CARI PAYMENT
      // ===============================
      const {
        data: payment,
        error: paymentError,
      } = await supabase
        .from("payments")
        .select("*")
        .eq("id", payment_id)
        .single();

      if (paymentError || !payment) {
        return res.status(404).json({
          success: false,
          message: "Payment tidak ditemukan",
        });
      }

      // ===============================
      // CEK STATUS
      // ===============================
      if (payment.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Payment yang sudah dibayar tidak dapat ditolak",
        });
      }

      if (payment.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Payment ini sudah ditolak",
        });
      }

      // ===============================
      // UPDATE PAYMENT
      // ===============================
      const {
        data: updatedPayment,
        error: updatePaymentError,
      } = await supabase
        .from("payments")
        .update({
          status: "rejected",
        })
        .eq("id", payment_id)
        .select()
        .single();

      if (updatePaymentError) {
        throw updatePaymentError;
      }

      // ===============================
      // UPDATE ORDER
      // ===============================
      const {
        data: updatedOrder,
        error: updateOrderError,
      } = await supabase
        .from("orders")
        .update({
          payment_status: "unpaid",
          status: "pending",
        })
        .eq("id", payment.order_id)
        .select()
        .single();

      if (updateOrderError) {
        throw updateOrderError;
      }

      // ===============================
      // RESPONSE
      // ===============================
      res.json({
        success: true,
        message: "Payment berhasil ditolak",
        data: {
          payment: updatedPayment,
          order: updatedOrder,
        },
      });
    } catch (err) {
      console.error("REJECT PAYMENT ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;