const crypto = require("node:crypto");
const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { createSnapClient, getMidtransConfig } = require("../config/midtrans");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const getPaymentState = (transactionStatus, fraudStatus) => {
  if (
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  ) {
    return "paid";
  }

  if (
    transactionStatus === "expire" ||
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    (transactionStatus === "capture" && fraudStatus === "deny")
  ) {
    return "failed";
  }

  return "pending";
};

router.get("/config", (_req, res) => {
  const config = getMidtransConfig();

  res.json({
    success: true,
    data: {
      provider: "midtrans",
      isConfigured: config.isConfigured,
      environment: config.isProduction ? "production" : "sandbox",
    },
  });
});

router.post(
  "/midtrans/notification",
  async (req, res) => {
    try {
      if (!getMidtransConfig().isConfigured) {
        return res.status(503).json({
          success: false,
          message: "Midtrans belum dikonfigurasi.",
        });
      }

      const notification = await createSnapClient().transaction.notification(
        req.body
      );
      const gatewayOrderId = notification.order_id;
      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      if (!gatewayOrderId || !transactionStatus) {
        return res.status(400).json({
          success: false,
          message: "Notifikasi Midtrans tidak lengkap.",
        });
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("id, order_id")
        .eq("gateway_order_id", gatewayOrderId)
        .maybeSingle();

      if (paymentError) throw paymentError;
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Transaksi Midtrans tidak dikenal.",
        });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, total_price")
        .eq("id", payment.order_id)
        .single();

      if (orderError) throw orderError;

      const notifiedAmount = Number(notification.gross_amount);
      if (
        notification.currency !== "IDR" ||
        !Number.isFinite(notifiedAmount) ||
        Math.round(notifiedAmount * 100) !==
          Math.round(Number(order.total_price) * 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Nominal atau mata uang transaksi tidak cocok.",
        });
      }

      const paymentState = getPaymentState(transactionStatus, fraudStatus);

      const { error: updateError } = await supabase.rpc(
        "apply_midtrans_payment_notification",
        {
          p_gateway_order_id: gatewayOrderId,
          p_payment_state: paymentState,
        }
      );

      if (updateError) throw updateError;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("MIDTRANS NOTIFICATION ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal memproses notifikasi pembayaran.",
      });
    }
  }
);

router.get(
  "/:orderId/status",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      if (!getMidtransConfig().isConfigured) {
        return res.status(503).json({
          success: false,
          message: "Midtrans belum dikonfigurasi.",
        });
      }

      const orderId = Number(req.params.orderId);
      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID order tidak valid.",
        });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, total_price, payment_status")
        .eq("id", orderId)
        .eq("user_id", req.user.id)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan.",
        });
      }

      if (order.payment_status === "paid") {
        return res.json({
          success: true,
          data: { payment_status: "paid" },
        });
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("gateway_order_id")
        .eq("order_id", orderId)
        .maybeSingle();

      if (paymentError) throw paymentError;
      if (!payment?.gateway_order_id) {
        return res.json({
          success: true,
          data: { payment_status: order.payment_status },
        });
      }

      const transaction = await createSnapClient().transaction.status(
        payment.gateway_order_id
      );
      const grossAmount = Number(transaction.gross_amount);
      if (
        transaction.order_id !== payment.gateway_order_id ||
        transaction.currency !== "IDR" ||
        !Number.isFinite(grossAmount) ||
        Math.round(grossAmount * 100) !==
          Math.round(Number(order.total_price) * 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Data transaksi Midtrans tidak cocok dengan order.",
        });
      }

      const paymentState = getPaymentState(
        transaction.transaction_status,
        transaction.fraud_status
      );
      const { error: updateError } = await supabase.rpc(
        "apply_midtrans_payment_notification",
        {
          p_gateway_order_id: payment.gateway_order_id,
          p_payment_state: paymentState,
        }
      );

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: { payment_status: paymentState },
      });
    } catch (err) {
      console.error("MIDTRANS STATUS CHECK ERROR:", err);
      return res.status(502).json({
        success: false,
        message: "Gagal memeriksa status transaksi Midtrans.",
      });
    }
  }
);

router.post(
  "/:orderId/checkout",
  verifyToken,
  checkRole("user"),
  async (req, res) => {
    try {
      const config = getMidtransConfig();
      if (!config.isConfigured) {
        return res.status(503).json({
          success: false,
          message: "Pembayaran belum tersedia. Midtrans belum dikonfigurasi.",
        });
      }

      const orderId = Number(req.params.orderId);
      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID order tidak valid.",
        });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, user_id, total_price, payment_status, ticket_reserved, customer_name, customer_email"
        )
        .eq("id", orderId)
        .eq("user_id", req.user.id)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan.",
        });
      }

      if (order.payment_status === "paid") {
        return res.status(409).json({
          success: false,
          message: "Order ini sudah dibayar.",
        });
      }

      const { data: existingPayment, error: existingPaymentError } =
        await supabase
          .from("payments")
          .select("id, status, gateway_order_id, snap_token, redirect_url")
          .eq("order_id", orderId)
          .maybeSingle();

      if (existingPaymentError) throw existingPaymentError;

      if (
        existingPayment?.status === "pending" &&
        existingPayment.redirect_url
      ) {
        return res.json({
          success: true,
          data: { redirect_url: existingPayment.redirect_url },
        });
      }

      if (!order.ticket_reserved) {
        const { error: reserveError } = await supabase.rpc(
          "reserve_existing_order",
          {
            p_order_id: orderId,
            p_user_id: Number(req.user.id),
          }
        );

        if (reserveError) {
          return res.status(409).json({
            success: false,
            message: reserveError.message,
          });
        }
      }

      const [{ data: orderItems, error: itemsError }, { data: user, error: userError }] =
        await Promise.all([
          supabase
            .from("order_items")
            .select("quantity, price, ticket_types(name)")
            .eq("order_id", orderId),
          supabase
            .from("users")
            .select("name, email")
            .eq("id", req.user.id)
            .single(),
        ]);

      if (itemsError) throw itemsError;
      if (userError) throw userError;
      if (!orderItems?.length) {
        return res.status(400).json({
          success: false,
          message: "Order tidak memiliki tiket.",
        });
      }

      const totalPrice = Number(order.total_price);
      if (!Number.isSafeInteger(totalPrice) || totalPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Total order tidak valid.",
        });
      }

      const gatewayOrderId = `concertix-${orderId}-${crypto.randomUUID()}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const transaction = await createSnapClient().createTransaction({
        transaction_details: {
          order_id: gatewayOrderId,
          gross_amount: totalPrice,
        },
        item_details: orderItems.map((item) => ({
          id: String(item.ticket_types?.name || "ticket").slice(0, 50),
          price: Number(item.price),
          quantity: Number(item.quantity),
          name: String(item.ticket_types?.name || "Tiket konser").slice(0, 50),
        })),
        customer_details: {
          first_name: order.customer_name || user.name,
          email: order.customer_email || user.email,
        },
        callbacks: {
          finish: `${frontendUrl}/orders/${orderId}`,
        },
      });

      const paymentData = {
        order_id: orderId,
        payment_method: "midtrans",
        payment_date: new Date().toISOString(),
        status: "pending",
        gateway_order_id: gatewayOrderId,
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
      };

      const paymentQuery = existingPayment
        ? supabase
            .from("payments")
            .update(paymentData)
            .eq("id", existingPayment.id)
        : supabase.from("payments").insert(paymentData);

      const { error: savePaymentError } = await paymentQuery;
      if (savePaymentError) throw savePaymentError;

      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ payment_status: "pending" })
        .eq("id", orderId)
        .eq("user_id", req.user.id);

      if (updateOrderError) throw updateOrderError;

      return res.status(201).json({
        success: true,
        data: { redirect_url: transaction.redirect_url },
      });
    } catch (err) {
      console.error("MIDTRANS CHECKOUT ERROR:", err);
      return res.status(500).json({
        success: false,
        message:
          err.message === "Midtrans belum dikonfigurasi."
            ? err.message
            : "Gagal menyiapkan pembayaran Midtrans.",
      });
    }
  }
);

router.get("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        order_id,
        payment_method,
        payment_date,
        status,
        orders (
          id,
          user_id,
          total_price,
          status,
          payment_status,
          created_at
        )
      `)
      .eq("orders.user_id", req.user.id)
      .order("payment_date", { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("GET PAYMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pembayaran.",
    });
  }
});

router.get(
  "/admin",
  verifyToken,
  checkRole("admin"),
  async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          order_id,
          payment_method,
          payment_date,
          status,
          orders (
            id,
            user_id,
            total_price,
            status,
            payment_status,
            created_at,
            customer_name,
            customer_email,
            users (id, name, email)
          )
        `)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      const paidOrderIds = data
        .filter((payment) => {
          const order = Array.isArray(payment.orders)
            ? payment.orders[0]
            : payment.orders;
          return order?.payment_status === "paid";
        })
        .map((payment) => payment.order_id);

      let ticketsByOrder = new Map();
      if (paidOrderIds.length > 0) {
        const { data: tickets, error: ticketsError } = await supabase
          .from("concert_tickets")
          .select(`
            id,
            order_id,
            attendee_number,
            ticket_code,
            checked_in_at,
            order_items (
              ticket_types (
                name,
                concerts (
                  title,
                  concert_date
                )
              )
            )
          `)
          .in("order_id", paidOrderIds)
          .order("id", { ascending: true });

        if (ticketsError) throw ticketsError;

        ticketsByOrder = (tickets || []).reduce((result, ticket) => {
          const existing = result.get(ticket.order_id) || [];
          existing.push(ticket);
          result.set(ticket.order_id, existing);
          return result;
        }, new Map());
      }

      return res.json({
        success: true,
        total: data.length,
        data: data.map((payment) => {
          const order = Array.isArray(payment.orders)
            ? payment.orders[0]
            : payment.orders;
          const user = Array.isArray(order?.users)
            ? order.users[0]
            : order?.users;

          return {
            ...payment,
            orders: order
              ? {
                  ...order,
                  customer_name: order.customer_name || user?.name || "",
                  customer_email: order.customer_email || user?.email || "",
                  tickets: ticketsByOrder.get(payment.order_id) || [],
                }
              : null,
          };
        }),
      });
    } catch (err) {
      console.error("GET ADMIN PAYMENT ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil transaksi pembayaran.",
      });
    }
  }
);

module.exports = router;
