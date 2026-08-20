const supabase = require("../config/supabase");

// GET ALL
const getAll = async () => {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
};

// GET BY ID
const getById = async (id) => {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

// CREATE
const create = async (artist) => {
  const { data, error } = await supabase
    .from("artists")
    .insert([artist])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// UPDATE
const update = async (id, artist) => {
  const { data, error } = await supabase
    .from("artists")
    .update(artist)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// DELETE
const remove = async (id) => {
  const { error } = await supabase
    .from("artists")
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