const supabaseAdmin = require("../config/supabaseAdmin");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const ORDER_SELECT_FIELDS = `
  id,
  order_number,
  status,
  total_amount,
  payment_method,
  created_at,
  users (id, name, email, phone),
  addresses (*),
  order_items (*)
`;

function formatOrderRecord(o) {
  const item = (o.order_items && o.order_items[0]) || {};
  const addr = o.addresses || {};
  const usr = o.users || {};

  return {
    id: o.order_number,
    dbId: o.id,
    orderNumber: o.order_number,
    orderDate: o.created_at,
    status: o.status,
    grandTotal: Number(o.total_amount) || 0,
    paymentMethod: o.payment_method,
    quantity: item.quantity || 1,
    itemsSubtotal: Number(item.subtotal) || Number(o.total_amount) || 0,
    product: {
      id: item.product_id,
      name: item.product_name || "Bibit Tanaman",
      price: item.price || 0,
    },
    customer: {
      name: addr.recipient_name || usr.name || "Pelanggan",
      phone: addr.phone || usr.phone || "-",
      address: addr.full_address || "-",
      city: addr.city || "Indonesia",
      email: usr.email || "-",
    },
  };
}

// Helper untuk mendapatkan next integer ID yang aman dari konflik primary key
async function getNextId(tableName) {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 1;
  return Number(data.id) + 1;
}

// Cari atau buat user di tabel public.users agar relasi foreign key valid
async function findOrCreateUser(email, name, phone) {
  const cleanEmail = (email || "pelanggan@bibitunggul.id").toLowerCase().trim();

  // Cek apakah user sudah ada
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id, name, email")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (existingUser) return existingUser;

  // Jika belum ada, buat user baru di public.users
  const nextUserId = await getNextId("users");
  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .insert({
      id: nextUserId,
      name: name || cleanEmail.split("@")[0],
      email: cleanEmail,
      password: "auth_managed_account",
      phone: phone || null,
      role: "customer",
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat user di public.users:", error.message);
    // Coba ambil lagi jika terkena race condition
    const { data: retryUser } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .ilike("email", cleanEmail)
      .maybeSingle();
    if (retryUser) return retryUser;
    throw error;
  }

  return newUser;
}

const createOrder = async (orderData) => {
  const {
    product,
    quantity = 1,
    itemsSubtotal,
    shippingFee = 0,
    grandTotal,
    customer = {},
    paymentMethod = "cod",
    bankDetails = null,
  } = orderData;

  if (!product || !product.name) {
    throw new Error("Data produk tidak valid");
  }

  const customerName = customer.name || "Pelanggan BibitUnggul";
  const customerPhone = customer.phone || "08123456789";
  const customerEmail = customer.email || "pembeli@bibitunggul.id";
  const customerAddress = customer.address || "Alamat belum diatur";
  const customerCity = customer.city || "Indonesia";
  const customerNotes = customer.notes || "";

  // 1. Dapatkan atau sinkronkan user di public.users
  const user = await findOrCreateUser(customerEmail, customerName, customerPhone);

  // 2. Simpan alamat di tabel public.addresses
  const nextAddrId = await getNextId("addresses");
  const fullAddressText = customerNotes
    ? `${customerAddress} (Catatan: ${customerNotes})`
    : customerAddress;

  const { data: addressRecord, error: addressError } = await supabaseAdmin
    .from("addresses")
    .insert({
      id: nextAddrId,
      user_id: user.id,
      recipient_name: customerName,
      phone: customerPhone,
      full_address: fullAddressText,
      city: customerCity,
      postal_code: null,
      is_default: true,
    })
    .select()
    .single();

  if (addressError) {
    console.warn("Peringatan simpan alamat:", addressError.message);
  }

  // 3. Buat pesanan di tabel public.orders
  const orderNumber = "BU-" + Date.now().toString().slice(-6);
  const status = paymentMethod === "cod" ? "processing" : "pending";
  const total = Number(grandTotal) || (Number(itemsSubtotal) || 0) + (Number(shippingFee) || 0);

  const nextOrderId = await getNextId("orders");
  const { data: orderRecord, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      id: nextOrderId,
      user_id: user.id,
      address_id: addressRecord ? addressRecord.id : null,
      order_number: orderNumber,
      status: status,
      total_amount: total,
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Gagal simpan order ke database:", orderError.message);
    throw new Error("Gagal menyimpan pesanan ke database: " + orderError.message);
  }

  // 4. Hubungkan ke produk dan simpan di tabel public.order_items
  let dbProductId = null;
  if (typeof product.id === "number" || (!isNaN(product.id) && !String(product.id).includes("prod-"))) {
    dbProductId = Number(product.id);
  } else {
    // Cari produk di Supabase berdasarkan nama jika id-nya format demo 'prod-1'
    const { data: matchedProduct } = await supabaseAdmin
      .from("products")
      .select("id")
      .ilike("name", `%${product.name.trim()}%`)
      .limit(1)
      .maybeSingle();

    if (matchedProduct) dbProductId = matchedProduct.id;
  }

  const nextItemId = await getNextId("order_items");
  const { data: itemRecord, error: itemError } = await supabaseAdmin
    .from("order_items")
    .insert({
      id: nextItemId,
      order_id: orderRecord.id,
      product_id: dbProductId,
      product_name: product.name,
      price: Number(product.price) || 0,
      quantity: Number(quantity) || 1,
      subtotal: Number(itemsSubtotal) || (Number(product.price) || 0) * (Number(quantity) || 1),
    })
    .select()
    .single();

  if (itemError) {
    console.warn("Peringatan simpan order_item:", itemError.message);
  }

  // 5. Kurangi stok produk di database jika produk terdaftar
  if (dbProductId) {
    try {
      const { data: curProd } = await supabaseAdmin
        .from("products")
        .select("stock")
        .eq("id", dbProductId)
        .single();

      if (curProd && curProd.stock !== null) {
        const newStock = Math.max(0, Number(curProd.stock) - Number(quantity));
        await supabaseAdmin
          .from("products")
          .update({ stock: newStock })
          .eq("id", dbProductId);
      }
    } catch (stockErr) {
      console.warn("Gagal update stok:", stockErr.message);
    }
  }

  // 6. Format respon yang ramah untuk frontend
  return {
    id: orderNumber,
    dbId: orderRecord.id,
    orderNumber: orderNumber,
    orderDate: orderRecord.created_at || new Date().toISOString(),
    status: orderRecord.status,
    product: {
      id: product.id,
      dbId: dbProductId,
      name: product.name,
      category: product.category,
      price: product.price,
      image_url: product.image_url,
    },
    quantity: Number(quantity),
    itemsSubtotal: Number(itemsSubtotal) || (Number(product.price) || 0) * (Number(quantity) || 1),
    shippingFee: Number(shippingFee) || 0,
    grandTotal: total,
    customer: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: customerAddress,
      city: customerCity,
      notes: customerNotes,
    },
    paymentMethod,
    bankDetails: paymentMethod === "transfer" ? bankDetails : null,
  };
};

const getAllOrders = async ({ email, status, search, page, limit, offset } = {}) => {
  const pagination = parsePagination({ page, limit, offset });

  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT_FIELDS, { count: "exact" })
    .order("id", { ascending: false });

  if (email) {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      return {
        data: [],
        pagination: buildPaginationMeta({
          total: 0,
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        }),
      };
    }
  }

  if (status && String(status).trim()) {
    query = query.ilike("status", String(status).trim());
  }

  if (search && String(search).trim()) {
    query = query.ilike("order_number", `%${String(search).trim()}%`);
  }

  query = query.range(pagination.from, pagination.to);

  const { data, count, error } = await query;
  if (error) throw error;

  const formatted = (data || []).map(formatOrderRecord);
  const total = count !== null && count !== undefined ? count : formatted.length;

  return {
    data: formatted,
    pagination: buildPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
      offset: pagination.offset,
    }),
  };
};

const getOrderById = async (id) => {
  const isNumeric = /^\d+$/.test(String(id));
  const column = isNumeric ? "id" : "order_number";
  const value = isNumeric ? Number(id) : String(id);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT_FIELDS)
    .eq(column, value)
    .maybeSingle();

  if (error) throw error;
  return data ? formatOrderRecord(data) : null;
};

const updateOrder = async (id, updates = {}) => {
  const isNumeric = /^\d+$/.test(String(id));
  const column = isNumeric ? "id" : "order_number";
  const value = isNumeric ? Number(id) : String(id);

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(cleanUpdates)
    .eq(column, value)
    .select(ORDER_SELECT_FIELDS)
    .maybeSingle();

  if (error) throw error;
  return data ? formatOrderRecord(data) : null;
};

const deleteOrder = async (id) => {
  const isNumeric = /^\d+$/.test(String(id));
  const column = isNumeric ? "id" : "order_number";
  const value = isNumeric ? Number(id) : String(id);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq(column, value)
    .select("id, order_number")
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
