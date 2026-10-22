
const supabase = require("../config/supabaseClient");

const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  getAllProducts,
};
