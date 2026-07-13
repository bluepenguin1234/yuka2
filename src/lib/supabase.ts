import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import type { Stage, Verdict } from './types';

/**
 * Backend is optional in v1: the app runs fully offline-first.
 * When EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are set
 * (see .env.example), accounts, scan sync, and coverage-gap telemetry
 * switch on automatically. See supabase/schema.sql for the backing tables.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;

/**
 * Every barcode we can't resolve is a coverage hole. Logging them (anonymously)
 * is how the database fills in category by category as scan demand reveals it.
 */
export async function logCoverageGap(barcode: string, stage: Stage): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('coverage_gaps').insert({ barcode, stage });
  } catch {
    // telemetry must never break the scan flow
  }
}

export async function logScan(entry: {
  barcode: string;
  productName: string;
  verdict: Verdict;
  stage: Stage;
}): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from('scans').insert({
      user_id: data.user.id,
      barcode: entry.barcode,
      product_name: entry.productName,
      verdict: entry.verdict,
      stage: entry.stage,
    });
  } catch {
    // telemetry must never break the scan flow
  }
}

export async function deleteAccount(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) return { ok: false, message: 'No account backend configured.' };
  try {
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) return { ok: false, message: error.message };
    await supabase.auth.signOut();
    return { ok: true, message: 'Your account and data were deleted.' };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}
