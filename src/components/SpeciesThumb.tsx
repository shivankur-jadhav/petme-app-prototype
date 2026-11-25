// A photo of a fish: the customer's own photo if they took one, otherwise a real photo of the
// species, with the drawn art as a stand-in while it loads, when the phone is offline, or when no
// freely licensed photo exists.
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { C, T } from "../theme";
import { CritterArt, Icon } from "./Icon";
import { Press, layout } from "./ui";
import { useSpeciesPhoto } from "../speciesPhoto";

type Species = { name: string; art: string; wiki: string[] };

export function SpeciesThumb({ species, own, size = 60 }: { species: Species; own?: string; size?: number }) {
  const photo = useSpeciesPhoto(own ? undefined : species.wiki);
  const [failed, setFailed] = useState<string | null>(null);
  const uri = own || photo?.uri;
  return (
    <View style={{ width: size, height: size, borderRadius: 6, overflow: "hidden", backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}>
      {uri && failed !== uri ? (
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
  const photo = useSpeciesPhoto(species.wiki);
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
  return (
    <Animated.View layout={layout} style={{ gap: 6 }}>
      <Press onPress={() => setOpen(!open)} scaleTo={0.98} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }} accessibilityLabel="Photo credits">
        <Icon name="gallery" size={14} color={C.muted} />
        <Text style={[T.small, { fontSize: 11 }]}>Photos from Wikimedia Commons · {open ? "Hide credits" : "Credits"}</Text>
      </Press>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ gap: 4 }}>
          {species.map((c) => <CreditLine key={c.name} species={c} />)}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
