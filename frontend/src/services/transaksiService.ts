// ============================================================
// services/transaksiService.ts
// Tabel di Supabase: "orders" + "order_items"
// ============================================================
import { supabase } from '@/lib/supabase';
import type { Transaksi, ApiResult } from '@/types';

const TABLE = 'orders';

export async function getTransaksi(): Promise<ApiResult<Transaksi[]>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, order_items(*, products(name, price))')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createTransaksi(
  payload: Omit<Transaksi, 'id' | 'created_at' | 'bibit'>
): Promise<ApiResult<Transaksi>> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

