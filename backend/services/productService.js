const supabase = require("../config/supabaseClient");

async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  return data;
}

module.exports = { getAllProducts };