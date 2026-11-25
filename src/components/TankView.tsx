// The customer's tank, drawn as a real aquarium: a hood with a light bar, glass with reflections and a
// base trim. Inside it plays the customer's own tank video on a silent loop, shows their photo with a
// slow drift, or falls back to the animated illustration until a video is added.
// The tank is underwater art, so it stays dark in both themes.
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { TankHero } from "./visuals";
import { Icon } from "./Icon";
import { Press } from "./ui";
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
};

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
  type, media, height = 210, tags, footer,
}: { type: TankType; media?: TankMedia; height?: number; tags?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <View style={s.tank}>
      <View style={s.hood}>
        <LinearGradient colors={[TANK.lightFade, TANK.light, TANK.lightFade]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.lightBar} />
      </View>
      <View style={[s.glass, { height }]}>
        {media?.kind === "video" ? (
          <LoopVideo key={media.uri} uri={media.uri} height={height} />
        ) : media?.kind === "image" ? (
          <DriftPhoto key={media.uri} uri={media.uri} height={height} />
        ) : (
          <TankHero type={type} height={height} framed />
        )}
        {/* light falling from the hood, a diagonal reflection on the glass, and the glass edges */}
        <LinearGradient pointerEvents="none" colors={[TANK.glow, TANK.glowFade]} style={[s.fill, { height: height * 0.35 }]} />
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
});
