// ============================================================
// services/bibitService.ts
// Semua komunikasi Supabase terkait data Bibit ada di sini
// Tabel di Supabase: "products"
// ============================================================
import { supabase } from '@/lib/supabase';
import type { Bibit, ApiResult } from '@/types';

const TABLE = 'products';

export async function getBibit(): Promise<ApiResult<Bibit[]>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function getBibitById(id: string): Promise<ApiResult<Bibit>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, categories(name)')
    .eq('id', id)
    .single();
  return { data, error: error?.message ?? null };
}

export async function createBibit(payload: Omit<Bibit, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResult<Bibit>> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateBibit(id: string, payload: Partial<Bibit>): Promise<ApiResult<Bibit>> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deleteBibit(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { data: null, error: error?.message ?? null };
}

