const supabase = require("../config/supabase");

// GET ALL
const getAll = async () => {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
};

// GET BY ID
const getById = async (id) => {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

// CREATE
const create = async (venue) => {
  const { data, error } = await supabase
    .from("venues")
    .insert([venue])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// UPDATE
const update = async (id, venue) => {
  const { data, error } = await supabase
    .from("venues")
    .update(venue)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// DELETE
const remove = async (id) => {
  const { error } = await supabase
    .from("venues")
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