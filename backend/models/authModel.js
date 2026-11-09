const supabase = require("../config/supabase");

// Cari user berdasarkan email
const findUserByEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Buat user baru
const createUser = async (user) => {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select()
    .single();

  if (error) throw error;

  return data;
};

module.exports = {
  findUserByEmail,
  createUser,
};