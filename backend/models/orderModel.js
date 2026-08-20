const supabase = require("../config/supabase");

// ======================
// CREATE ORDER
// ======================
exports.createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        user_id: orderData.user_id,
        total_price: orderData.total_price,
        status: "pending",
        payment_status: "unpaid",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// ======================
// CREATE ORDER ITEMS
// ======================
exports.createOrderItems = async (items) => {
  const { data, error } = await supabase
    .from("order_items")
    .insert(items)
    .select();

  if (error) throw error;

  return data;
};

// ======================
// GET ORDERS USER
// ======================
exports.getOrdersByUser = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        ticket_type_id,
        quantity,
        price,
        subtotal,
        ticket_types (
          id,
          concert_id,
          name
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

// ======================
// GET ORDER BY ID
// ======================
exports.getOrderById = async (orderId, userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        ticket_type_id,
        quantity,
        price,
        subtotal,
        ticket_types (
          id,
          concert_id,
          name
        )
      )
    `)
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return data;
};