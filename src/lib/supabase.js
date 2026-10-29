import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Safe client instance that won't crash when keys are not yet pasted
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Helper to check if Supabase is properly configured in .env
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Generic helper to fetch text/data from any Supabase table
 * (ready for when you provide your schema)
 */
export async function getTableData(tableName, selectQuery = "*") {
  if (!supabase) {
    console.warn(
      `[Supabase] Client not initialized. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env`
    );
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }

  return await supabase.from(tableName).select(selectQuery);
}

/**
 * Generic helper to insert text/data into any Supabase table
 */
export async function insertTableData(tableName, payload) {
  if (!supabase) {
    console.warn(
      `[Supabase] Client not initialized. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env`
    );
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }

  return await supabase.from(tableName).insert(payload);
}

export default supabase;
