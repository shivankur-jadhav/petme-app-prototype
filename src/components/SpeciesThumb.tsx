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
import { ALL_IDEAS, STOCK } from "../data";

type Species = { name: string; art: string; wiki: string[] };

export function SpeciesThumb({ species, own, size = 60, round }: { species: Species; own?: string; size?: number; round?: boolean }) {
  const bundled = SPECIES_PHOTOS[species.art];
  const photo = useSpeciesPhoto(own || bundled ? undefined : species.wiki);
  const [failed, setFailed] = useState<string | null>(null);
  const uri = own || photo?.uri;
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
  const found = names.map((n) => ({ n, s: speciesByName(n) }));
  const known = found.map((f) => f.s).filter(Boolean) as Species[];
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {label ? <Text style={T.label}>{label}</Text> : null}
        {found.map(({ n, s }) => (
          <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 3, paddingRight: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.tertTint }}>
            {s ? <SpeciesThumb species={s} size={26} round /> : null}
            <Text style={[T.small, { color: C.ink }]}>{n}</Text>
          </View>
        ))}
      </View>
      <PhotoCredits species={known} />
    </View>
  );
}
