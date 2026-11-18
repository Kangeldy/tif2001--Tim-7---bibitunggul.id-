// ============================================================
// services/kategoriService.ts
// Tabel di Supabase: "categories"
// ============================================================
import { supabase } from '@/lib/supabase';
import type { Kategori, ApiResult } from '@/types';

const TABLE = 'categories';

export async function getKategori(): Promise<ApiResult<Kategori[]>> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true });
  return { data, error: error?.message ?? null };
}

export async function createKategori(payload: Omit<Kategori, 'id' | 'created_at'>): Promise<ApiResult<Kategori>> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateKategori(id: string, payload: Partial<Kategori>): Promise<ApiResult<Kategori>> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deleteKategori(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return { data: null, error: error?.message ?? null };
}

