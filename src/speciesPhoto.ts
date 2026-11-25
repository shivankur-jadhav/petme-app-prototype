// Real photos of each species, looked up on the phone from Wikipedia's lead image for the species and
// Wikimedia Commons for a small thumbnail plus the photographer and licence. Only freely licensed
// photos on Commons are used (a drawing, a map or a non-free image is skipped), and every one is
// credited in the app. Results are cached on the phone, so each lookup happens once.
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpeciesPhoto = { uri: string; credit: string; license: string; source: string };

const KEY = "petme:species-photos:v1";
const UA = { "Api-User-Agent": "PetMe/0.1 (aquarium service app prototype)" };
const cache: Record<string, SpeciesPhoto | null> = {};
const pending: Record<string, Promise<SpeciesPhoto | null>> = {};
let loaded: Promise<void> | null = null;

function loadCache() {
  if (!loaded) {
    loaded = AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) Object.assign(cache, JSON.parse(raw)); })
      .catch(() => {});
  }
  return loaded;
}
const saveCache = () => AsyncStorage.setItem(KEY, JSON.stringify(cache)).catch(() => {});
const plain = (html?: string) => (html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const short = (s: string, n = 48) => (s.length > n ? s.slice(0, n - 1).trim() + "…" : s);

async function lookup(titles: string[]): Promise<{ photo: SpeciesPhoto | null; offline: boolean }> {
  let offline = false;
  for (const title of titles) {
    try {
      const sum = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`, { headers: UA });
      if (!sum.ok) continue;
      const j = await sum.json();
      const src: string | undefined = j?.originalimage?.source || j?.thumbnail?.source;
      if (!src) continue;
      const clean = src.split("?")[0];
      if (!/\.jpe?g$/i.test(clean)) continue; // photos only
      // ".../commons/a/ab/Name.jpg" or ".../thumb/a/ab/Name.jpg/320px-Name.jpg" -> "Name.jpg"
      const parts = clean.split("/");
      const file = decodeURIComponent(clean.includes("/thumb/") ? parts[parts.length - 2] : parts[parts.length - 1]);
      const info = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=320&titles=${encodeURIComponent("File:" + file)}`,
        { headers: UA }
      ).then((r) => r.json());
      const page: any = Object.values(info?.query?.pages || {})[0];
      const ii = page?.imageinfo?.[0];
      if (!ii?.thumburl) continue; // not on Commons, so not freely licensed
      const md = ii.extmetadata || {};
      return {
        offline: false,
        photo: {
          uri: ii.thumburl,
          credit: short(plain(md.Artist?.value) || "Unknown photographer"),
          license: plain(md.LicenseShortName?.value) || "see source",
          source: ii.descriptionurl || "",
        },
      };
    } catch {
      offline = true;
    }
  }
  return { photo: null, offline };
}

export async function getSpeciesPhoto(titles: string[]): Promise<SpeciesPhoto | null> {
  const key = titles[0];
  await loadCache();
  if (key in cache) return cache[key];
  if (!pending[key]) {
    pending[key] = lookup(titles).then(({ photo, offline }) => {
      delete pending[key];
      // Remember a miss only when the lookup really ran, so an offline moment doesn't stick.
      if (photo || !offline) { cache[key] = photo; saveCache(); }
      return photo;
    });
  }
  return pending[key];
}

export function useSpeciesPhoto(titles?: string[]) {
  const key = titles?.[0];
  const [photo, setPhoto] = useState<SpeciesPhoto | null | undefined>(key && key in cache ? cache[key] : undefined);
  useEffect(() => {
    if (!titles?.length) return;
    let live = true;
    getSpeciesPhoto(titles).then((p) => { if (live) setPhoto(p); });
    return () => { live = false; };
  }, [key]);
  return photo; // undefined while loading, null when there is no free photo
}
