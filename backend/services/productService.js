const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

let supabase;
try {
  supabase = require("../config/supabaseAdmin");
} catch {
  supabase = require("../config/supabaseClient");
}

const ALLOWED_SORT_COLUMNS = new Set(["id", "name", "price", "stock", "created_at"]);

const getAllProducts = async (filters = {}) => {
  const {
    category,
    search,
    q,
    minPrice,
    maxPrice,
    inStock,
    sortBy = "id",
    sortOrder = "desc",
    page,
    limit,
    offset,
  } = filters;

  const pagination = parsePagination({ page, limit, offset });
  const orderColumn = ALLOWED_SORT_COLUMNS.has(sortBy) ? sortBy : "id";
  const ascending = String(sortOrder).toLowerCase() === "asc";

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order(orderColumn, { ascending });

  if (category && String(category).trim()) {
    query = query.ilike("category", String(category).trim());
  }

  const rawSearch = (search ?? q ?? "").toString().trim();
  if (rawSearch) {
    const safeSearch = rawSearch.replace(/[,()]/g, " ").trim();
    if (safeSearch) {
      query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
    }
  }

  if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(Number(minPrice))) {
    query = query.gte("price", Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
    query = query.lte("price", Number(maxPrice));
  }

  if (inStock === "true" || inStock === true) {
    query = query.gt("stock", 0);
  }

  query = query.range(pagination.from, pagination.to);

  const { data, count, error } = await query;
  if (error) throw error;

  const rows = data || [];
  const total = count !== null && count !== undefined ? count : rows.length;

  return {
    data: rows,
    pagination: buildPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
  };
};

const getProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const createProduct = async (productData) => {
  const slug =
    (productData.slug ||
      (productData.name || "bibit")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")) +
    "-" +
    Date.now();
  const payload = { ...productData, slug };
  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateProduct = async (id, productData) => {
  const cleanData = Object.fromEntries(
    Object.entries(productData).filter(([_, v]) => v !== undefined)
  );
  const { data, error } = await supabase
    .from("products")
    .update(cleanData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

const deleteProduct = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
