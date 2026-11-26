// A photo of a fish: the customer's own photo if they took one, otherwise the real species photo
// bundled with the app (src/speciesPhotos.ts). A species without a bundled photo falls back to a
// Wikipedia lookup, and the drawn art shows while that loads or if no free photo exists.
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { C, T } from "../theme";
import { CritterArt, Icon } from "./Icon";
import { Press, layout } from "./ui";
import { useSpeciesPhoto } from "../speciesPhoto";
import { SPECIES_PHOTOS } from "../speciesPhotos";
import { useMediaUri } from "../webMedia";
import { ALL_IDEAS, STOCK } from "../data";
import { FishView, useFishViewer } from "./FishViewer";

type Species = { name: string; art: string; wiki: string[] };

/** Tap-to-zoom wrapper: pass `zoom` to make the thumbnail open the full-screen viewer. */
export function SpeciesThumb(props: { species: Species; own?: string; size?: number; round?: boolean; zoom?: boolean | { extra?: FishView["extra"]; mine?: FishView["mine"] } }) {
  const openFish = useFishViewer();
  const { species, own, size = 60, zoom } = props;
  if (!zoom) return <Thumb {...props} />;
  return (
    <Press
      onPress={() => openFish({ name: species.name, art: species.art, wiki: species.wiki, own, extra: typeof zoom === "object" ? zoom.extra : undefined, mine: typeof zoom === "object" ? zoom.mine : undefined })}
      scaleTo={0.94}
      accessibilityLabel={`View photo of ${species.name}`}
    >
      <Thumb {...props} />
      {size >= 56 ? (
        <View pointerEvents="none" style={{ position: "absolute", right: 4, bottom: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(6,20,38,0.7)", alignItems: "center", justifyContent: "center" }}>
          <Icon name="expand" size={11} color="#FFFFFF" width={2.2} />
        </View>
      ) : null}
    </Press>
  );
}

function Thumb({ species, own, size = 60, round }: { species: Species; own?: string; size?: number; round?: boolean }) {
  const bundled = SPECIES_PHOTOS[species.art];
  const photo = useSpeciesPhoto(own || bundled ? undefined : species.wiki);
  const [failed, setFailed] = useState<string | null>(null);
  const ownUri = useMediaUri(own);
  const uri = own ? ownUri : photo?.uri;
  return (
    <View style={{ width: size, height: size, borderRadius: round ? size / 2 : 6, overflow: "hidden", backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}>
      {!own && bundled ? (
        <Animated.Image source={bundled.src} resizeMode="cover" accessibilityLabel={`Photo of ${species.name}`} style={{ width: size, height: size }} />
      ) : uri && failed !== uri ? (
        <Animated.Image
          key={uri}
          entering={FadeIn.duration(350)}
          source={{ uri }}
          resizeMode="cover"
          onError={() => setFailed(uri)}
          accessibilityLabel={`Photo of ${species.name}`}
          style={{ width: size, height: size }}
        />
      ) : (
        <CritterArt art={species.art} width={Math.round(size * 0.8)} />
      )}
    </View>
  );
}

function CreditLine({ species }: { species: Species }) {
  const bundled = SPECIES_PHOTOS[species.art];
  const looked = useSpeciesPhoto(bundled ? undefined : species.wiki);
  const photo = bundled || looked;
  if (!photo) return null;
  return (
    <Press onPress={() => { if (photo.source.startsWith("https://")) Linking.openURL(photo.source).catch(() => {}); }} scaleTo={0.99} accessibilityRole="link">
      <Text style={[T.small, { fontSize: 11 }]}>
        <Text style={{ color: C.ink2 }}>{species.name}</Text>: {photo.credit}, {photo.license}
      </Text>
    </Press>
  );
}

/** "Photo credits" toggle for the stock photos on screen. Their licences require the credit. */
export function PhotoCredits({ species }: { species: Species[] }) {
  const [open, setOpen] = useState(false);
  if (!species.length) return null;
  const allBundled = species.every((c) => SPECIES_PHOTOS[c.art]);
  return (
    <Animated.View layout={layout} style={{ gap: 6 }}>
      <Press onPress={() => setOpen(!open)} scaleTo={0.98} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }} accessibilityLabel="Photo credits">
        <Icon name="gallery" size={14} color={C.muted} />
        <Text style={[T.small, { fontSize: 11 }]}>Photos from {allBundled ? "iNaturalist" : "iNaturalist and Wikimedia Commons"} · {open ? "Hide credits" : "Credits"}</Text>
      </Press>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ gap: 4 }}>
          {species.map((c) => <CreditLine key={c.name} species={c} />)}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** Find a species by the name saved on a booking (wishlist), from the suggestions or the current stock. */
const KNOWN: Species[] = [
  ...ALL_IDEAS.map((f) => ({ name: f.name, art: f.id, wiki: f.wiki })),
  ...STOCK.salt, ...STOCK.fresh,
];
export const speciesByName = (name: string) => KNOWN.find((s) => s.name === name);

/** Fish named on a booking, each with a small round photo, plus the photo credits the licences require. */
export function FishChips({ names, label }: { names: string[]; label?: string }) {
  const openFish = useFishViewer();
  const found = names.map((n) => ({ n, s: speciesByName(n) }));
  const known = found.map((f) => f.s).filter(Boolean) as Species[];
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {label ? <Text style={T.label}>{label}</Text> : null}
        {found.map(({ n, s }) => (
          <Press key={n} disabled={!s} scaleTo={0.95} accessibilityLabel={`View ${n}`}
            onPress={() => { if (s) openFish({ name: s.name, art: s.art, wiki: s.wiki }); }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 3, paddingRight: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.tertTint }}>
            {s ? <SpeciesThumb species={s} size={26} round /> : null}
            <Text style={[T.small, { color: C.ink }]}>{n}</Text>
          </Press>
        ))}
      </View>
      <PhotoCredits species={known} />
    </View>
  );
}
