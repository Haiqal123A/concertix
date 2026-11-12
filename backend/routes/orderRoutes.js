const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { getMidtransConfig } = require("../config/midtrans");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

const hideUnpaidTicketDetails = (order) => {
  const orderItems = order.order_items || [];

  return {
    ...order,
    ticket_count: orderItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),
    order_items:
      order.payment_status === "paid" ? orderItems : [],
  };
};

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
      if (!getMidtransConfig().isConfigured) {
        return res.status(503).json({
          success: false,
          message: "Checkout belum tersedia sampai Midtrans dikonfigurasi.",
        });
      }

      const { items } = req.body;
      const customerName =
        typeof req.body.customer_name === "string"
          ? req.body.customer_name.trim().replace(/\s+/g, " ")
          : "";
      const customerEmail =
        typeof req.body.customer_email === "string"
          ? req.body.customer_email.trim().toLowerCase()
          : "";

      if (
        customerName.length < 3 ||
        customerName.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
        customerEmail.length > 254
      ) {
        return res.status(400).json({
          success: false,
          message: "Nama lengkap dan alamat email yang valid wajib diisi.",
        });
      }

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

      const normalizedItems = items.map((item) => ({
        ticket_type_id: Number(item.ticket_type_id),
        quantity: Number(item.quantity),
      }));

      if (
        normalizedItems.some(
          (item) =>
            !Number.isSafeInteger(item.ticket_type_id) ||
            item.ticket_type_id <= 0 ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Item tiket tidak valid.",
        });
      }

      const { data, error } = await supabase.rpc(
        "create_order_with_reservations",
        {
          p_user_id: Number(req.user.id),
          p_items: normalizedItems,
        }
      );

      if (error) {
        if (error.code === "P0001") {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
        throw error;
      }

      const { error: customerError } = await supabase
        .from("orders")
        .update({
          customer_name: customerName,
          customer_email: customerEmail,
        })
        .eq("id", data.order.id)
        .eq("user_id", Number(req.user.id));

      if (customerError) throw customerError;

      res.status(201).json({
        success: true,
        message: "Order berhasil dibuat",
        data,
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
          customer_name,
          customer_email,
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
        data: data.map(hideUnpaidTicketDetails),
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
          customer_name,
          customer_email,
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
          customer_name,
          customer_email,
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

      let tickets = [];
      if (data.payment_status === "paid") {
        const { data: issuedTickets, error: ticketsError } = await supabase
          .from("concert_tickets")
          .select(`
            id,
            order_id,
            order_item_id,
            attendee_number,
            ticket_code,
            checked_in_at,
            order_items (
              ticket_types (
                name,
                concerts (
                  title,
                  poster,
                  concert_date,
                  concert_time,
                  venues (
                    name,
                    city,
                    address
                  )
                )
              )
            )
          `)
          .eq("order_id", order_id)
          .order("id", { ascending: true });

        if (ticketsError) throw ticketsError;
        tickets = issuedTickets;
      }

      res.json({
        success: true,
        message: "Detail order berhasil diambil",
        data: {
          ...hideUnpaidTicketDetails(data),
          tickets,
        },
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