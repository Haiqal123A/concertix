const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// =====================================================
// POST /api/orders
// User membuat order baru
// =====================================================
router.post(
  "/",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const { items } = req.body;

      // ===============================
      // VALIDASI ITEMS
      // ===============================
      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimal harus ada 1 tiket",
        });
      }

      let total_price = 0;
      const orderItems = [];

      // ===============================
      // CEK SETIAP TIKET
      // ===============================
      for (const item of items) {
        const { ticket_type_id, quantity } = item;

        if (
          !ticket_type_id ||
          !quantity ||
          Number(quantity) <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "ticket_type_id dan quantity wajib diisi",
          });
        }

        const {
          data: ticket,
          error: ticketError,
        } = await supabase
          .from("ticket_types")
          .select("*")
          .eq("id", ticket_type_id)
          .single();

        if (ticketError || !ticket) {
          return res.status(404).json({
            success: false,
            message: `Ticket type ${ticket_type_id} tidak ditemukan`,
          });
        }

        // ===============================
        // CEK STOK TERSEDIA
        // ===============================
        const availableStock =
          Number(ticket.stock) - Number(ticket.sold);

        if (availableStock < Number(quantity)) {
          return res.status(400).json({
            success: false,
            message: `Stok tiket ${ticket.name} tidak mencukupi`,
          });
        }

        const subtotal =
          Number(ticket.price) * Number(quantity);

        total_price += subtotal;

        orderItems.push({
          ticket_type_id: Number(ticket_type_id),
          quantity: Number(quantity),
          price: Number(ticket.price),
          subtotal,
        });
      }

      // ===============================
      // BUAT ORDER
      // ===============================
      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          user_id,
          total_price,
          status: "pending",
          payment_status: "unpaid",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // ===============================
      // BUAT ORDER ITEMS
      // ===============================
      const itemsToInsert = orderItems.map((item) => ({
        order_id: order.id,
        ticket_type_id: item.ticket_type_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      const {
        data: insertedItems,
        error: itemError,
      } = await supabase
        .from("order_items")
        .insert(itemsToInsert)
        .select();

      if (itemError) {
        throw itemError;
      }

      // =================================================
      // SOLD TIDAK DIUPDATE DI SINI
      //
      // sold baru bertambah ketika admin
      // melakukan verifikasi payment.
      // =================================================

      res.status(201).json({
        success: true,
        message: "Order berhasil dibuat",
        data: {
          order,
          items: insertedItems,
        },
      });
    } catch (err) {
      console.error("ORDER ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// GET /api/orders
// User melihat semua order miliknya
// =====================================================
router.get(
  "/",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      const user_id = req.user.id;

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          total_price,
          status,
          payment_status,
          created_at,

          order_items (
            id,
            quantity,
            price,
            subtotal,

            ticket_types (
              id,
              name,
              price,

              concerts (
                id,
                title,
                poster,
                description,
                concert_date,
                concert_time,
                status,

                venues (
                  id,
                  name,
                  city,
                  address
                )
              )
            )
          ),

          payments (
            id,
            payment_method,
            payment_proof,
            payment_date,
            status
          )
        `)
        .eq("user_id", user_id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: "Data order berhasil diambil",
        total: data.length,
        data,
      });
    } catch (err) {
      console.error("GET USER ORDERS ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// GET /api/orders/admin
// Admin melihat semua order
// =====================================================
router.get(
  "/admin",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select(`
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
          ),

          order_items (
            id,
            quantity,
            price,
            subtotal,

            ticket_types (
              id,
              name,
              price,

              concerts (
                id,
                title,
                poster,
                description,
                concert_date,
                concert_time,
                status,

                venues (
                  id,
                  name,
                  city,
                  address
                )
              )
            )
          ),

          payments (
            id,
            payment_method,
            payment_proof,
            payment_date,
            status
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: "Data semua order berhasil diambil",
        total: data.length,
        data,
      });
    } catch (err) {
      console.error("GET ADMIN ORDERS ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// GET /api/orders/admin/statistics
// Statistik order untuk dashboard admin
// =====================================================
router.get(
  "/admin/statistics",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const {
        data: orders,
        error: ordersError,
      } = await supabase
        .from("orders")
        .select(
          "id, total_price, status, payment_status"
        );

      if (ordersError) {
        throw ordersError;
      }

      // ===============================
      // TOTAL ORDER
      // ===============================
      const totalOrders = orders.length;

      // ===============================
      // PENDING ORDER
      // ===============================
      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      ).length;

      // ===============================
      // CONFIRMED ORDER
      // ===============================
      const confirmedOrders = orders.filter(
        (order) => order.status === "confirmed"
      ).length;

      // ===============================
      // TOTAL REVENUE
      // HANYA ORDER PAID
      // ===============================
      const totalRevenue = orders
        .filter(
          (order) =>
            order.payment_status === "paid"
        )
        .reduce(
          (total, order) =>
            total + Number(order.total_price),
          0
        );

      // ===============================
      // PENDING PAYMENT
      // ===============================
      const pendingPayments = orders.filter(
        (order) =>
          order.payment_status === "pending"
      ).length;

      // ===============================
      // RESPONSE
      // ===============================
      res.json({
        success: true,
        message: "Statistik admin berhasil diambil",
        data: {
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          confirmed_orders: confirmedOrders,
          total_revenue: totalRevenue,
          pending_payments: pendingPayments,
        },
      });
    } catch (err) {
      console.error(
        "ADMIN STATISTICS ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================================
// GET /api/orders/:id
// Detail order milik user
// =====================================================
router.get(
  "/:id",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const order_id = req.params.id;

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          total_price,
          status,
          payment_status,
          created_at,

          order_items (
            id,
            quantity,
            price,
            subtotal,

            ticket_types (
              id,
              name,
              price,

              concerts (
                id,
                title,
                poster,
                description,
                concert_date,
                concert_time,
                status,

                venues (
                  id,
                  name,
                  city,
                  address
                )
              )
            )
          ),

          payments (
            id,
            payment_method,
            payment_proof,
            payment_date,
            status
          )
        `)
        .eq("id", order_id)
        .eq("user_id", user_id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Detail order berhasil diambil",
        data,
      });
    } catch (err) {
      console.error(
        "GET ORDER DETAIL ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;