import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ensures any ID is a valid PostgreSQL UUID v4 string.
 * Converts deterministic seed IDs (e.g. "dentist-1", "clinic-2", "opp-3")
 * into consistent UUIDs so foreign keys and upserts work seamlessly.
 */
export function toUuid(id) {
  if (!id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const str = String(id).trim();
  if (UUID_REGEX.test(str)) return str.toLowerCase();

  // Deterministic mapping for built-in seed IDs
  const m = str.match(/^([a-z]+)-(\d+)$/i);
  if (m) {
    const prefix = m[1].toLowerCase();
    const num = String(parseInt(m[2], 10) || 1).padStart(12, "0");
    const typeCode =
      prefix === "dentist"
        ? "8001"
        : prefix === "clinic"
        ? "8002"
        : prefix === "opp"
        ? "8003"
        : prefix === "app"
        ? "8004"
        : prefix === "user"
        ? "8005"
        : "8009";
    return `00000000-0000-4000-${typeCode}-${num}`;
  }

  // Hash arbitrary string into deterministic UUID format
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>> 0;
  h2 = (Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)) >>> 0;
  const hex1 = h1.toString(16).padStart(8, "0");
  const hex2 = h2.toString(16).padStart(8, "0");
  return `${hex1}-0000-4000-8000-${hex2}0000`;
}

/**
 * Broadcasts a local + cross-tab change event so all open views and
 * the Admin Dashboard update immediately alongside Supabase Realtime.
 */
export function notifyRealtimeChange(table, action = "UPDATE", record = null) {
  if (typeof window === "undefined") return;
  const detail = { table, action, record, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("doh-db-change", { detail }));
}

/**
 * Subscribes to live Supabase PostgreSQL Realtime changes on all core tables
 * plus local/cross-tab state updates.
 */
export function subscribeToRealtime(onEvent) {
  if (typeof window === "undefined") return () => {};

  const handleLocal = (e) => {
    if (onEvent) onEvent(e.detail || { table: "local", action: "SYNC" });
  };
  const handleStorage = (e) => {
    if (e.key && e.key.startsWith("doh_") && onEvent) {
      onEvent({ table: e.key, action: "STORAGE_SYNC", timestamp: new Date().toISOString() });
    }
  };

  window.addEventListener("doh-db-change", handleLocal);
  window.addEventListener("storage", handleStorage);

  let channel = null;
  if (supabase) {
    channel = supabase
      .channel("dental-hub-pro-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => onEvent && onEvent({ table: "users", action: payload.eventType, record: payload.new || payload.old, source: "supabase" })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opportunities" },
        (payload) => onEvent && onEvent({ table: "opportunities", action: payload.eventType, record: payload.new || payload.old, source: "supabase" })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => onEvent && onEvent({ table: "applications", action: payload.eventType, record: payload.new || payload.old, source: "supabase" })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follow_ups" },
        (payload) => onEvent && onEvent({ table: "follow_ups", action: payload.eventType, record: payload.new || payload.old, source: "supabase" })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs" },
        (payload) => onEvent && onEvent({ table: "audit_logs", action: payload.eventType, record: payload.new || payload.old, source: "supabase" })
      )
      .subscribe();
  }

  return () => {
    window.removeEventListener("doh-db-change", handleLocal);
    window.removeEventListener("storage", handleStorage);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
}

export default supabase;
