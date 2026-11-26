// Record or choose a video (or photo) of the customer's real tank, and keep a copy in the app's own
// storage so it is still there after the phone clears its cache.
// For a real launch, upload the file to shared storage (e.g. Supabase Storage) so the technician's
// recording reaches the customer's phone; today it stays on the phone it was recorded on.
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { TankMedia } from "./data";
import { deleteWebFile, storeWebFile } from "./webMedia";

export type PickResult = { media: TankMedia } | { denied: true } | { canceled: true };

export async function pickTankMedia(source: "camera" | "library", by: TankMedia["by"], ref?: string, photoOnly = false): Promise<PickResult> {
  if (source === "camera") {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (!cam.granted) return { denied: true };
  }
  // "Record a video" opens the rear camera in video mode; choosing from the phone accepts videos and photos.
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: photoOnly ? ["images"] : source === "camera" ? ["videos"] : ["videos", "images"],
    cameraType: ImagePicker.CameraType.back,
    videoMaxDuration: 30,
    quality: 0.8,
    allowsEditing: photoOnly, // lets the person crop a fish photo to a square
    aspect: [1, 1],
  };
  const res = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (res.canceled || !res.assets?.length) return { canceled: true };
  const asset = res.assets[0];
  const kind: TankMedia["kind"] = asset.type === "video" ? "video" : "image";
  const uri = Platform.OS === "web" ? await storeWebFile(asset.uri, `tank-${Date.now()}`) : keepCopy(asset.uri, kind);
  return { media: { uri, kind, addedAt: Date.now(), by, ref } };
}

const FOLDER = "tank-media";

/** Copy into the app's document folder. Falls back to the original file if copying fails. */
function keepCopy(uri: string, kind: TankMedia["kind"]): string {
  try {
    const dir = new Directory(Paths.document, FOLDER);
    if (!dir.exists) dir.create();
    const ext = uri.split("?")[0].match(/\.([a-z0-9]{2,5})$/i)?.[1] || (kind === "video" ? "mp4" : "jpg");
    const dest = new File(dir, `tank-${Date.now()}.${ext}`);
    new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

/** Delete a saved copy when it is replaced or removed. Never touches files outside our folder. */
export function forgetMedia(media?: TankMedia) {
  if (media && Platform.OS === "web") { deleteWebFile(media.uri); return; }
  if (!media || !media.uri.includes(FOLDER)) return;
  try {
    const f = new File(media.uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
}

/** Newest of the customer's own video and any video a technician attached to a finished visit. */
export function latestTankMedia(own: TankMedia | undefined, fromVisits: (TankMedia | undefined)[]): TankMedia | undefined {
  return [own, ...fromVisits].filter(Boolean).sort((a, b) => b!.addedAt - a!.addedAt)[0];
}
