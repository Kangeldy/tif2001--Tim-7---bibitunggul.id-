// ============================================================
// Global Types untuk project Bibit Unggul
// Disesuaikan dengan schema Supabase (supabase_schema.sql)
// ============================================================

// Tabel: products
export interface Bibit {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // relasi (dari join)
  categories?: Pick<Kategori, 'name'>;
}

// Tabel: categories
export interface Kategori {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Tabel: orders
export interface Transaksi {
  id: number;
  user_id: number;
  address_id?: number | null;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  // relasi
  order_items?: OrderItem[];
}

// Tabel: order_items
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface User {
  id: string;
  email: string;
  nama?: string;
}

// ---- API Response wrapper ----
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

