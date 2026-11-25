// A real photo of a species, with the drawn art as a stand-in while it loads, when the phone is
// offline, or when no freely licensed photo exists.
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { C, T } from "../theme";
import { CritterArt, Icon } from "./Icon";
import { Press, layout } from "./ui";
import { useSpeciesPhoto } from "../speciesPhoto";
import { Critter } from "../data";

export function SpeciesThumb({ critter, size = 60 }: { critter: Critter; size?: number }) {
  const photo = useSpeciesPhoto(critter.wiki);
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width: size, height: size, borderRadius: 6, overflow: "hidden", backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}>
      {photo && !failed ? (
        <Animated.Image
          entering={FadeIn.duration(350)}
          source={{ uri: photo.uri }}
          resizeMode="cover"
          onError={() => setFailed(true)}
          accessibilityLabel={`Photo of ${critter.name}`}
          style={{ width: size, height: size }}
        />
      ) : (
        <CritterArt art={critter.art} width={Math.round(size * 0.8)} />
      )}
    </View>
  );
}

function CreditLine({ critter }: { critter: Critter }) {
  const photo = useSpeciesPhoto(critter.wiki);
  if (!photo) return null;
  return (
    <Press onPress={() => { if (photo.source.startsWith("https://")) Linking.openURL(photo.source).catch(() => {}); }} scaleTo={0.99} accessibilityRole="link">
      <Text style={[T.small, { fontSize: 11 }]}>
        <Text style={{ color: C.ink2 }}>{critter.name}</Text>: {photo.credit}, {photo.license}
      </Text>
    </Press>
  );
}

/** "Photo credits" toggle. The licences on these photos require the credit to be shown. */
export function PhotoCredits({ critters }: { critters: Critter[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Animated.View layout={layout} style={{ gap: 6 }}>
      <Press onPress={() => setOpen(!open)} scaleTo={0.98} style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }} accessibilityLabel="Photo credits">
        <Icon name="gallery" size={14} color={C.muted} />
        <Text style={[T.small, { fontSize: 11 }]}>Photos from Wikimedia Commons · {open ? "Hide credits" : "Credits"}</Text>
      </Press>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ gap: 4 }}>
          {critters.map((c) => <CreditLine key={c.name} critter={c} />)}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
