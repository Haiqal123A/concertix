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

const findUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, description")
    .eq("id", id)
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

const listStaff = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, description, role")
    .eq("role", "petugas")
    .order("name", { ascending: true });

  if (error) throw error;

  return data;
};

const updateStaff = async (id, fields) => {
  const { data, error } = await supabase
    .from("users")
    .update(fields)
    .eq("id", id)
    .eq("role", "petugas")
    .select("id, name, email, description, role")
    .maybeSingle();

  if (error) throw error;

  return data;
};

const deleteStaff = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .eq("role", "petugas")
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  listStaff,
  updateStaff,
  deleteStaff,
};