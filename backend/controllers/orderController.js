const supabase = require("../config/supabase");
const Order = require("../models/orderModel");

// ======================
// CREATE ORDER
// ======================
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    // Validasi
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item tiket tidak boleh kosong",
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    // ======================
    // CEK SETIAP TIKET
    // ======================
    for (const item of items) {
      const { ticket_type_id, quantity } = item;

      if (!ticket_type_id || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "ticket_type_id dan quantity harus valid",
        });
      }

      // Ambil ticket type
      const { data: ticket, error } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("id", ticket_type_id)
        .single();

      if (error || !ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket type ${ticket_type_id} tidak ditemukan`,
        });
      }

      // Cek stock
      const availableStock = ticket.stock - ticket.sold;

      if (quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Stock tiket ${ticket.name} tidak mencukupi`,
        });
      }

      const subtotal = Number(ticket.price) * Number(quantity);

      totalPrice += subtotal;

      orderItems.push({
        ticket_type_id: ticket.id,
        quantity: quantity,
        price: ticket.price,
        subtotal: subtotal,
      });
    }

    // ======================
    // BUAT ORDER
    // ======================
    const order = await Order.createOrder({
      user_id: userId,
      total_price: totalPrice,
    });

    // Tambahkan order_id
    const itemsWithOrderId = orderItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    // ======================
    // BUAT ORDER ITEMS
    // ======================
    const createdItems = await Order.createOrderItems(itemsWithOrderId);

    // ======================
    // UPDATE STOCK & SOLD
    // ======================
    for (const item of items) {
      const { data: ticket } = await supabase
        .from("ticket_types")
        .select("sold")
        .eq("id", item.ticket_type_id)
        .single();

      await supabase
        .from("ticket_types")
        .update({
          sold: ticket.sold + item.quantity,
        })
        .eq("id", item.ticket_type_id);
    }

    res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      data: {
        order,
        items: createdItems,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// GET MY ORDERS
// ======================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Order.getOrdersByUser(userId);

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

// ======================
// GET ORDER DETAIL
// ======================
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const data = await Order.getOrderById(orderId, userId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Order tidak ditemukan",
    });
  }
};