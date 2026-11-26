// Web only (the browser version / artifact): keep recorded or chosen tank videos and fish photos in
// the browser's IndexedDB, so they survive a page reload. The browser hands the picker a temporary
// blob: link that dies on reload; we store the file itself and save "idb:<key>" as the media uri.
// Each viewer's files stay in their own browser. Every call fails soft: no storage just means the
// file lasts until the page reloads.
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DB = "petme-media";
const STORE = "files";
export const IDB_PREFIX = "idb:";
const live: Record<string, string> = {}; // key -> blob: url for this page load

function open(): Promise<any> {
  return new Promise((resolve, reject) => {
    const idb = (globalThis as any).indexedDB;
    if (!idb) return reject(new Error("no IndexedDB"));
    const req = idb.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function run<T>(mode: "readonly" | "readwrite", fn: (store: any) => any): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}

/** Store a picked file (by its temporary blob: or data: uri). Returns "idb:<key>", or the original uri if storing fails. */
export async function storeWebFile(uri: string, key: string): Promise<string> {
  try {
    const blob = await (await fetch(uri)).blob();
    await run("readwrite", (s) => s.put(blob, key));
    live[key] = uri;
    return IDB_PREFIX + key;
  } catch {
    return uri;
  }
}

export async function deleteWebFile(uri: string) {
  if (!uri.startsWith(IDB_PREFIX)) return;
  const key = uri.slice(IDB_PREFIX.length);
  try { await run("readwrite", (s) => s.delete(key)); } catch { /* already gone */ }
  delete live[key];
}

async function resolveWebFile(uri: string): Promise<string | null> {
  const key = uri.slice(IDB_PREFIX.length);
  if (live[key]) return live[key];
  try {
    const blob = await run<any>("readonly", (s) => s.get(key));
    if (!blob) return null;
    live[key] = (globalThis as any).URL.createObjectURL(blob);
    return live[key];
  } catch {
    return null;
  }
}

/** The uri to show for saved media: unchanged on phones; on the web, "idb:" files become a playable link. */
export function useMediaUri(uri?: string): string | undefined {
  const stored = Platform.OS === "web" && !!uri && uri.startsWith(IDB_PREFIX);
  const [shown, setShown] = useState<string | undefined>(stored ? live[uri!.slice(IDB_PREFIX.length)] : uri);
  useEffect(() => {
    if (!stored) { setShown(uri); return; }
    let on = true;
    resolveWebFile(uri!).then((u) => { if (on) setShown(u || undefined); });
    return () => { on = false; };
  }, [uri]);
  return shown;
}
