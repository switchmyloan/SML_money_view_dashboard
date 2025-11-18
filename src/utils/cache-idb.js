import { get, set } from "idb-keyval";

export async function saveCache(key, data, ttlMinutes = 10) {
  const expiry = Date.now() + ttlMinutes * 60 * 1000;

  await set(key, {
    data,
    expiry
  });
}

export async function loadCache(key) {
  const entry = await get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    return null; // expired
  }

  return entry.data;
}
