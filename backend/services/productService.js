
let supabase;
try {
  supabase = require("../config/supabaseAdmin");
} catch {
  supabase = require("../config/supabaseClient");
}

const getAllProducts = async ({ category, search } = {}) => {
  let query = supabase.from("products").select("*").order("id", { ascending: false });
  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("name", `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const getProductById = async (id) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return null;
  return data;
};

const createProduct = async (productData) => {
  const slug = (productData.slug || (productData.name || 'bibit').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now();
  const payload = { ...productData, slug };
  const { data, error } = await supabase.from("products").insert([payload]).select().single();
  if (error) throw error;
  return data;
};

const updateProduct = async (id, productData) => {
  const cleanData = Object.fromEntries(Object.entries(productData).filter(([_, v]) => v !== undefined));
  const { data, error } = await supabase.from("products").update(cleanData).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
