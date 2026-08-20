const supabase = require("../config/supabase");

// Ambil semua kategori
const getAll = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
};

// Ambil kategori berdasarkan id
const getById = async (id) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// Tambah kategori
const create = async (category) => {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Update kategori
const update = async (id, category) => {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Hapus kategori
const remove = async (id) => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};