// Tap any fish photo to open it full screen: pinch or double-tap to zoom, drag to look around,
// swipe down (or tap ×) to close. Under the photo: name, scientific name, size, origin, care level,
// a plain description, and the photo credit the licence requires.
// Built on PanResponder + Reanimated so it needs no extra native package and works in Expo Go.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Image, Linking, Modal, PanResponder, ScrollView, Text, View, ViewStyle, useWindowDimensions } from "react-native";

type Transform = NonNullable<ViewStyle["transform"]>;
import Animated, { FadeIn, FadeOut, SlideInDown, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, SPRING, T } from "../theme";
import { CritterArt, Icon } from "./Icon";
import { Badge, Press, haptic } from "./ui";
import { SPECIES_PHOTOS } from "../speciesPhotos";
import { SPECIES_INFO } from "../speciesInfo";
import { useSpeciesPhoto } from "../speciesPhoto";
import { largePhotoUrl } from "../zoomPhoto";

export type FishView = {
  name: string;
  art: string;
  wiki?: string[];
  own?: string; // the customer's own photo of this fish
  extra?: { label: string; tone?: string }[]; // e.g. "In your tank: 2", "Good fit"
};

const Ctx = createContext<(f: FishView) => void>(() => {});
/** Open the fish viewer from anywhere: `const openFish = useFishViewer(); openFish({ name, art })`. */
export const useFishViewer = () => useContext(Ctx);

export function FishViewerProvider({ children }: { children: React.ReactNode }) {
  const [fish, setFish] = useState<FishView | null>(null);
  const open = useCallback((f: FishView) => { haptic.soft(); setFish(f); }, []);
  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal visible={!!fish} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setFish(null)}>
        {fish ? <Viewer fish={fish} onClose={() => setFish(null)} /> : null}
      </Modal>
    </Ctx.Provider>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const dist = (t: readonly any[]) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
const MAX = 4;

/** Pinch, pan and double-tap zoom for one image filling a box of `w` x `h`. */
function Zoomable({ w, h, onDismiss, onDrag, children }: { w: number; h: number; onDismiss: () => void; onDrag: (p: number) => void; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const g = useRef({ scale: 1, tx: 0, ty: 0, d: 0, x: 0, y: 0, pinch: false, lastTap: 0, moved: false });
  const limit = (s: number) => ({ x: (w * s - w) / 2, y: (h * s - h) / 2 });

  const begin = (t: readonly any[]) => {
    Object.assign(g.current, { scale: scale.value, tx: tx.value, ty: ty.value, x: t[0].pageX, y: t[0].pageY, pinch: t.length >= 2, d: t.length >= 2 ? dist(t) : 0 });
  };
  const zoomTo = (s: number, x = 0, y = 0) => {
    const b = limit(s);
    scale.value = withSpring(s, SPRING);
    tx.value = withSpring(clamp(x, -b.x, b.x), SPRING);
    ty.value = withSpring(clamp(y, -b.y, b.y), SPRING);
  };

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => { begin(e.nativeEvent.touches); g.current.moved = false; },
    onPanResponderMove: (e) => {
      const t = e.nativeEvent.touches;
      if (t.length >= 2) {
        if (!g.current.pinch) begin(t);
        g.current.moved = true;
        const s = clamp((g.current.scale * dist(t)) / (g.current.d || 1), 1, MAX);
        const b = limit(s);
        scale.value = s;
        tx.value = clamp(g.current.tx * (s / g.current.scale), -b.x, b.x);
        ty.value = clamp(g.current.ty * (s / g.current.scale), -b.y, b.y);
      } else if (t.length === 1) {
        if (g.current.pinch) { begin(t); return; }
        const dx = t[0].pageX - g.current.x, dy = t[0].pageY - g.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) g.current.moved = true;
        if (scale.value > 1.01) {
          const b = limit(scale.value);
          tx.value = clamp(g.current.tx + dx, -b.x, b.x);
          ty.value = clamp(g.current.ty + dy, -b.y, b.y);
        } else if (dy > 0) {
          ty.value = dy; // swipe down to close
          onDrag(Math.min(1, dy / 300));
        }
      }
    },
    onPanResponderRelease: (e) => {
      const p = e.nativeEvent;
      if (scale.value <= 1.01) {
        if (ty.value > 110) { onDismiss(); return; }
        ty.value = withSpring(0, SPRING); onDrag(0);
      }
      if (scale.value < 1) zoomTo(1);
      if (!g.current.moved) {
        const now = Date.now();
        if (now - g.current.lastTap < 280) {
          g.current.lastTap = 0;
          haptic.tap();
          if (scale.value > 1.2) zoomTo(1);
          else zoomTo(2.5, (w / 2 - p.locationX) * 1.5, (h / 2 - p.locationY) * 1.5);
        } else g.current.lastTap = now;
      }
    },
  }), [w, h]);

  const a = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }] as Transform }));
  return (
    <View style={{ width: w, height: h, overflow: "hidden" }} {...pan.panHandlers}>
      <Animated.View style={[{ width: w, height: h }, a]}>{children}</Animated.View>
    </View>
  );
}

function Viewer({ fish, onClose }: { fish: FishView; onClose: () => void }) {
  const ins = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const box = Math.min(width, height * 0.55);
  const bundled = SPECIES_PHOTOS[fish.art];
  const looked = useSpeciesPhoto(fish.own || bundled ? undefined : fish.wiki);
  const info = SPECIES_INFO[fish.art];
  const [large, setLarge] = useState<string | null>(null);
  const [largeShown, setLargeShown] = useState(false);
  const [hint, setHint] = useState(true);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (fish.own || !bundled) return;
    let live = true;
    largePhotoUrl(bundled.source).then((u) => { if (live) setLarge(u); });
    return () => { live = false; };
  }, [fish.art, fish.own]);
  useEffect(() => { const t = setTimeout(() => setHint(false), 2600); return () => clearTimeout(t); }, []);

  const backdrop = useAnimatedStyle(() => ({ opacity: fade.value }));
  const onDrag = (p: number) => { fade.value = 1 - p * 0.6; };
  const close = onClose;

  const credit = fish.own ? null : bundled ? { who: bundled.credit, lic: bundled.license, url: bundled.source, site: "iNaturalist" } : looked ? { who: looked.credit, lic: looked.license, url: looked.source, site: "Wikimedia Commons" } : null;
  const baseSource = fish.own ? { uri: fish.own } : bundled ? bundled.src : looked ? { uri: looked.uri } : null;
  const careTone = info?.care === "Easy" ? "ok" : info?.care === "Moderate" ? "warn" : "crit";

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(2,8,18,0.94)" }, backdrop]} />
      <View style={{ paddingTop: ins.top + 8, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 8 }}>
          <Press onPress={close} accessibilityLabel="Close photo" style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Icon name="close" size={20} color="#FFFFFF" width={2} />
          </Press>
        </View>

        <Animated.View entering={ZoomIn.springify().damping(16)} style={{ alignSelf: "center" }}>
          <Zoomable w={width} h={box} onDismiss={close} onDrag={onDrag}>
            {baseSource ? (
              <View style={{ width, height: box }}>
                <Image source={baseSource as any} resizeMode="contain" style={{ width, height: box }} accessibilityLabel={`Photo of ${fish.name}`} />
                {large ? (
                  <Animated.Image
                    source={{ uri: large }}
                    resizeMode="contain"
                    onLoad={() => setLargeShown(true)}
                    style={{ position: "absolute", left: 0, top: 0, width, height: box, opacity: largeShown ? 1 : 0 }}
                  />
                ) : null}
              </View>
            ) : (
              <View style={{ width, height: box, alignItems: "center", justifyContent: "center" }}>
                <CritterArt art={fish.art} width={Math.round(width * 0.6)} />
              </View>
            )}
          </Zoomable>
          {hint ? (
            <Animated.View entering={FadeIn.delay(400)} exiting={FadeOut} pointerEvents="none" style={{ position: "absolute", bottom: 10, alignSelf: "center", backgroundColor: "rgba(6,20,38,0.75)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontFamily: F.body500, fontSize: 12, color: "#E2F2FF" }}>Pinch or double-tap to zoom</Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        <Animated.View entering={SlideInDown.springify().damping(20).stiffness(170)} style={{ flex: 1, marginTop: 12, backgroundColor: C.s, borderTopLeftRadius: R.xl + 6, borderTopRightRadius: R.xl + 6, borderWidth: 1, borderColor: C.line }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: ins.bottom + 24, gap: 12 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 2 }}>
              <Text style={T.h1}>{fish.name}</Text>
              {info ? <Text style={[T.body2, { fontStyle: "italic" }]}>{info.sci}</Text> : null}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {fish.own ? <Badge text="Your photo" tone="cyan" /> : null}
              {(fish.extra || []).map((x) => <Badge key={x.label} text={x.label} tone={x.tone || "tert"} />)}
              {info ? <Badge text={`Care: ${info.care}`} tone={careTone} dot /> : null}
            </View>
            {info ? (
              <View style={{ flexDirection: "row", borderWidth: 1, borderColor: C.hair, borderRadius: R.md, overflow: "hidden" }}>
                {[["Adult size", info.size], ["Comes from", info.origin]].map(([k, v], i) => (
                  <View key={k} style={{ flex: 1, padding: 10, gap: 3, borderLeftWidth: i ? 1 : 0, borderLeftColor: C.hair }}>
                    <Text style={T.label}>{k}</Text>
                    <Text style={[T.body, { fontFamily: F.head600 }]}>{v}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {info ? <Text style={[T.body, { lineHeight: 22 }]}>{info.about}</Text> : null}
            {credit ? (
              <Press scaleTo={0.99} accessibilityRole="link" onPress={() => { if (credit.url.startsWith("https://")) Linking.openURL(credit.url).catch(() => {}); }}>
                <Text style={[T.small, { fontSize: 11 }]}>Photo: {credit.who}, {credit.lic}, via {credit.site}. Tap to see the original.</Text>
              </Press>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
