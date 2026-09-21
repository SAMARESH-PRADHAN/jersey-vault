/**
 * localStorage helper wrapper.
 *
 * SWAP POINT FOR REAL APIs:
 * Every read/write in this app goes through these two functions.
 * To move to a real backend, replace `read`/`write` with fetch calls
 * (or keep them as an offline cache) — no component changes needed.
 */

export const KEYS = {
  users: "jf_users",
  session: "jf_session",
  cart: "jf_cart",
  addresses: "jf_addresses",
  orders: "jf_orders",
  reviews: "jf_reviews",
} as const;

export function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function remove(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
