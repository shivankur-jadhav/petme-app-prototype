// The customer's tank, drawn as a real aquarium: a hood with a light bar, glass with reflections and a
// base trim. Inside it plays the customer's own tank video on a silent loop, shows their photo with a
// slow drift. Over either, gentle water life: light sweeping through the water, the hood light
// breathing, and a few bubbles rising up the glass. Until one is added, the empty tank asks the
// customer to film theirs.
// The tank is underwater art, so it stays dark in both themes.
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { Easing, FadeIn, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

type Transform = NonNullable<ViewStyle["transform"]>;
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { Icon } from "./Icon";
import { Btn, Press } from "./ui";
import { useMediaUri } from "../webMedia";
import { F } from "../theme";
import { TankMedia, TankType, fmtDate, iso } from "../data";

const TANK = {
  frame: "#0a1424",
  lip: "#16243a",
  light: "rgba(125,211,252,0.95)",
  lightFade: "rgba(125,211,252,0)",
  glow: "rgba(186,230,253,0.20)",
  glowFade: "rgba(186,230,253,0)",
  shine: "rgba(255,255,255,0.08)",
  shineFade: "rgba(255,255,255,0)",
  edge: "rgba(186,230,253,0.22)",
  shade: "rgba(6,20,38,0.6)",
  shadeFade: "rgba(6,20,38,0)",
  pill: "rgba(6,20,38,0.72)",
  pillText: "#E2F2FF",
  pillSub: "rgba(226,242,255,0.75)",
  water: ["#0f3a5c", "#0a2a45", "#071d33"] as const,
  sweep: "rgba(224,242,254,0.13)",
  bubble: "rgba(224,242,254,0.75)",
  bubbleFill: "rgba(224,242,254,0.12)",
  ring: "rgba(186,230,253,0.35)",
};

/** Water life over the customer's video or photo: one light sweep, a breathing glow, three bubbles. */
function WaterLife({ height }: { height: number }) {
  const [w, setW] = useState(0);
  const sweep = useSharedValue(0);
  const glow = useSharedValue(0.6);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 2800 }), withTiming(0.55, { duration: 2800 })), -1);
  }, []);
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -w * 0.6 + sweep.value * w * 1.2 }, { rotate: "18deg" }] as Transform }));
  const top = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: 0, height: height * 0.4 }, top]}>
        <LinearGradient colors={[TANK.glow, TANK.glowFade]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {w ? (
        <Animated.View style={[{ position: "absolute", top: -height * 0.3, width: w * 0.35, height: height * 1.6 }, band]}>
          <LinearGradient colors={[TANK.shineFade, TANK.sweep, TANK.shineFade]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      {w ? [0.86, 0.9, 0.12].map((x, i) => <Bubble key={i} x={w * x + (i === 1 ? 6 : 0)} delay={i * 1500} rise={height - 24} size={i === 1 ? 4 : 6} />) : null}
    </View>
  );
}

function Bubble({ x, delay, rise, size }: { x: number; delay: number; rise: number; size: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 4600, easing: Easing.in(Easing.quad) }), -1, false));
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.1, 0.8, 1], [0, 0.85, 0.6, 0]),
    transform: [{ translateY: -p.value * rise }, { translateX: Math.sin(p.value * 12) * 3 }, { scale: 0.7 + p.value * 0.5 }] as Transform,
  }));
  return <Animated.View style={[{ position: "absolute", left: x, bottom: 10, width: size, height: size, borderRadius: size, borderWidth: 1, borderColor: TANK.bubble, backgroundColor: TANK.bubbleFill }, a]} />;
}

/** Small picture of a tank for lists: its photo, a tiny live loop of its video, or the tank icon. */
export function TankThumb({ media, size = 40, active, fallback }: { media?: TankMedia; size?: number; active?: boolean; fallback: React.ReactNode }) {
  const uri = useMediaUri(media?.uri);
  return (
    <View style={{ width: size, height: size, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: TANK.frame, borderWidth: active ? 1.5 : 0, borderColor: TANK.light }}>
      {media && uri ? (media.kind === "video" ? <ThumbVideo uri={uri} size={size} /> : <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />) : fallback}
    </View>
  );
}
function ThumbVideo({ uri, size }: { uri: string; size: number }) {
  const player = useVideoPlayer(uri, (p) => { p.loop = true; p.muted = true; p.play(); });
  return <VideoView player={player} style={{ width: size, height: size }} contentFit="cover" nativeControls={false} />;
}

function LoopVideo({ uri, height }: { uri: string; height: number }) {
  const ref = useRef<VideoView>(null);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <Animated.View entering={FadeIn.duration(500)} style={{ height }}>
      <VideoView
        ref={ref}
        player={player}
        style={{ width: "100%", height }}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={false}
      />
      <Press
        onPress={() => { ref.current?.enterFullscreen().catch(() => {}); }}
        accessibilityLabel="Watch full screen"
        style={[s.pill, { position: "absolute", right: 10, bottom: 10 }]}
      >
        <Icon name="expand" size={14} color={TANK.pillText} width={2} />
        <Text style={s.pillText}>Full screen</Text>
      </Press>
    </Animated.View>
  );
}

function DriftPhoto({ uri, height }: { uri: string; height: number }) {
  const z = useSharedValue(1);
  useEffect(() => {
    z.value = withRepeat(withTiming(1.08, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: z.value }] }));
  return <Animated.Image entering={FadeIn.duration(500)} source={{ uri }} resizeMode="cover" style={[{ width: "100%", height }, a]} />;
}

/** The tank before the customer has filmed it: an invitation to record, right inside the glass. */
function FilmYourTank({ height, onAdd, busy }: { height: number; onAdd?: (source: "camera" | "library") => void; busy?: boolean }) {
  return (
    <View style={[s.empty, { height }]}>
      <LinearGradient colors={TANK.water} style={StyleSheet.absoluteFill} />
      <View style={s.emptyIcon}><Icon name="video" size={20} color={TANK.pillText} width={1.8} /></View>
      <Text style={s.emptyTitle}>Film your tank</Text>
      <Text style={s.emptyText}>Your video plays here on a silent loop.</Text>
      {onAdd ? (
        <>
          <View style={{ marginTop: 6 }}><Btn small label="Record a video" icon="camera" disabled={busy} onPress={() => onAdd("camera")} /></View>
          <Press onPress={() => onAdd("library")} disabled={busy} accessibilityRole="button" accessibilityLabel="Choose a video from my phone" style={{ paddingVertical: 4 }}>
            <Text style={s.emptyLink}>or choose from my phone</Text>
          </Press>
        </>
      ) : null}
    </View>
  );
}

/** Small dark label that sits on the glass, e.g. "Your video · Nov 20". */
export function TankPill({ text, icon }: { text: string; icon?: string }) {
  return (
    <View style={s.pill}>
      {icon ? <Icon name={icon} size={13} color={TANK.pillText} width={2} /> : null}
      <Text style={s.pillText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

export const mediaCaption = (m: TankMedia) =>
  `${m.by === "technician" ? "Recorded at your visit" : "Your " + (m.kind === "video" ? "video" : "photo")} · ${fmtDate(iso(new Date(m.addedAt)), false)}`;

export function TankView({
  type, media, height = 210, tags, footer, onAdd, busy,
}: { type: TankType; media?: TankMedia; height?: number; tags?: React.ReactNode; footer?: React.ReactNode; onAdd?: (source: "camera" | "library") => void; busy?: boolean }) {
  const uri = useMediaUri(media?.uri); // on the web, saved files are looked up in the browser's storage
  return (
    <View style={s.tank}>
      <View style={s.hood}>
        <LinearGradient colors={[TANK.lightFade, TANK.light, TANK.lightFade]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.lightBar} />
      </View>
      <View style={[s.glass, { height }]}>
        {media?.kind === "video" && uri ? (
          <LoopVideo key={uri} uri={uri} height={height} />
        ) : media?.kind === "image" && uri ? (
          <DriftPhoto key={uri} uri={uri} height={height} />
        ) : (
          <FilmYourTank height={height} onAdd={onAdd} busy={busy} />
        )}
        {/* light falling from the hood (alive when there is a video or photo), a diagonal reflection on the glass, and the glass edges */}
        {media && uri ? <WaterLife height={height} /> : <LinearGradient pointerEvents="none" colors={[TANK.glow, TANK.glowFade]} style={[s.fill, { height: height * 0.35 }]} />}
        <LinearGradient pointerEvents="none" colors={[TANK.shineFade, TANK.shine, TANK.shineFade]} locations={[0.3, 0.45, 0.6]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fill} />
        {media ? <LinearGradient pointerEvents="none" colors={[TANK.shade, TANK.shadeFade]} style={[s.fill, { height: 64 }]} /> : null}
        <View pointerEvents="none" style={s.edges} />
        {tags ? <View pointerEvents="box-none" style={s.tags}>{tags}</View> : null}
        {footer ? <View pointerEvents="box-none" style={s.footer}>{footer}</View> : null}
      </View>
      <View style={s.trim} />
    </View>
  );
}

const s = StyleSheet.create({
  tank: { backgroundColor: TANK.frame, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden" },
  hood: { height: 14, backgroundColor: TANK.frame, borderBottomWidth: 2, borderBottomColor: TANK.lip, justifyContent: "flex-end" },
  lightBar: { height: 3, marginHorizontal: 18, marginBottom: 2, borderRadius: 2 },
  glass: { overflow: "hidden", marginHorizontal: 6 },
  fill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  edges: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderLeftWidth: 1, borderRightWidth: 1, borderColor: TANK.edge },
  trim: { height: 8, backgroundColor: TANK.frame, borderTopWidth: 2, borderTopColor: TANK.lip },
  tags: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  footer: { position: "absolute", left: 10, bottom: 10, right: 120 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: TANK.pill, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontFamily: F.body500, fontSize: 12, color: TANK.pillText, flexShrink: 1 },
  empty: { alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 24, paddingTop: 18 },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: TANK.ring, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  emptyTitle: { fontFamily: F.head600, fontSize: 18, color: TANK.pillText },
  emptyText: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: TANK.pillSub, textAlign: "center", maxWidth: 280 },
  emptyLink: { fontFamily: F.body500, fontSize: 13, color: TANK.pillText, textDecorationLine: "underline" },
});
