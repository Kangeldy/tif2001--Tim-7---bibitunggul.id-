// ============================================================
// services/authService.ts
// Semua komunikasi Supabase terkait Auth ada di sini
// ============================================================
import { supabase } from '@/lib/supabase';
import type { ApiResult } from '@/types';

export async function login(email: string, password: string): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { data: null, error: error?.message ?? null };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

