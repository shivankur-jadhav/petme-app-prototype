// Full-size versions of the bundled species photos, for the zoom view. The app bundles small 360px
// crops; when a photo is opened, the 1024px "large" version is loaded from iNaturalist (the same
// photo, same licence). The bundled crop shows at once, and the large one fades in when it arrives.
import { Image } from "react-native";

const cache: Record<string, string | null> = {};
const pending: Record<string, Promise<string | null>> = {};

/** `source` is the iNaturalist photo page, e.g. https://www.inaturalist.org/photos/363228268 */
export function largePhotoUrl(source?: string): Promise<string | null> {
  const id = source?.match(/inaturalist\.org\/photos\/(\d+)/)?.[1];
  if (!id) return Promise.resolve(null);
  if (id in cache) return Promise.resolve(cache[id]);
  if (!pending[id]) {
    pending[id] = find(id).then((url) => {
      delete pending[id];
      if (url) cache[id] = url;
      return url;
    });
  }
  return pending[id];
}

async function find(id: string): Promise<string | null> {
  // 1) The API gives the exact file name (its extension varies between photos).
  try {
    const r = await fetch(`https://api.inaturalist.org/v1/photos/${id}`);
    if (r.ok) {
      const j = await r.json();
      const small: string | undefined = j?.results?.[0]?.url;
      if (small) {
        const large = small.replace(/\/(square|small|medium|thumb)\./, "/large.");
        if (await Image.prefetch(large).catch(() => false)) return large;
      }
    }
  } catch {
    // fall through to guessing
  }
  // 2) Open-data bucket with the common extensions.
  for (const ext of ["jpg", "jpeg", "png"]) {
    const url = `https://inaturalist-open-data.s3.amazonaws.com/photos/${id}/large.${ext}`;
    if (await Image.prefetch(url).catch(() => false)) return url;
  }
  return null;
}
