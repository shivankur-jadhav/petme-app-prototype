// Animated visuals: the living tank hero, metric pods with range gauges, the bottom tab bar and the bottom sheet.
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, SPRING, T } from "../theme";
import { Icon } from "./Icon";
import { Badge, haptic } from "./ui";
import { Metric, TankType, chemOf, judge } from "../data";

/* ---------------- Tank hero ---------------- */
function SwimFish({ width, top, color, size, duration, delay }: { width: number; top: number; color: string; size: number; duration: number; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(2, { duration: duration * 2, easing: Easing.linear }), -1, false));
  }, [duration, delay]);
  const range = Math.max(0, width - size - 24);
  const a = useAnimatedStyle(() => {
    const t = p.value < 1 ? p.value : 2 - p.value;
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    return {
      transform: [
        { translateX: 12 + eased * range },
        { translateY: Math.sin(p.value * Math.PI * 3) * 4 },
        { scaleX: p.value < 1 ? -1 : 1 },
      ],
    };
  });
  return (
    <Animated.View style={[{ position: "absolute", top, left: 0 }, a]}>
      <Svg width={size} height={size * 0.62} viewBox="0 0 48 30">
        <Path d="M4 15c6-10 20-12 28-4l10-6v20l-10-6c-8 8-22 6-28-4z" fill={color} />
        <Circle cx={13} cy={13} r={1.8} fill={C.bg} />
      </Svg>
    </Animated.View>
  );
}

function Bubble({ x, delay, height }: { x: number; delay: number; height: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 4200, easing: Easing.out(Easing.quad) }), -1, false));
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.15, 0.85, 1], [0, 0.7, 0.5, 0]),
    transform: [{ translateY: -p.value * (height - 30) }, { translateX: Math.sin(p.value * 10) * 3 }],
  }));
  return <Animated.View style={[{ position: "absolute", left: x, bottom: 22, width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: "#bae6fd" }, a]} />;
}

export function TankHero({ type, children }: { type: TankType; children?: React.ReactNode }) {
  const salt = chemOf(type) === "salt";
  const [w, setW] = useState(0);
  const h = 168;
  const rays = useSharedValue(0.5);
  useEffect(() => { rays.value = withRepeat(withSequence(withTiming(1, { duration: 2600 }), withTiming(0.45, { duration: 2600 })), -1); }, []);
  const raysStyle = useAnimatedStyle(() => ({ opacity: rays.value }));
  const fish = salt
    ? [{ c: "#F97316", top: 52, s: 34, d: 7000, dl: 0 }, { c: "#FACC15", top: 92, s: 26, d: 9000, dl: 900 }, { c: "#CBD5E1", top: 34, s: 22, d: 8000, dl: 1800 }]
    : [{ c: "#38BDF8", top: 48, s: 22, d: 6000, dl: 0 }, { c: "#38BDF8", top: 62, s: 22, d: 6200, dl: 250 }, { c: "#38BDF8", top: 40, s: 22, d: 6400, dl: 500 }, { c: "#E2E8F0", top: 104, s: 30, d: 9500, dl: 1200 }];
  return (
    <View style={hs.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <LinearGradient colors={["#0c3a57", "#082a42", "#061f33"]} style={[StyleSheet.absoluteFill]} />
      <Animated.View style={[StyleSheet.absoluteFill, raysStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 400 168" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <SvgGrad id="lt" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7dd3fc" stopOpacity={0.24} />
              <Stop offset="1" stopColor="#7dd3fc" stopOpacity={0} />
            </SvgGrad>
          </Defs>
          <Path d="M90 0l40 168H70zM210 0l30 168h-50zM320 0l20 168h-40z" fill="url(#lt)" />
        </Svg>
      </Animated.View>
      <Svg width="100%" height="100%" viewBox="0 0 400 168" preserveAspectRatio="xMidYMax slice" style={StyleSheet.absoluteFill}>
        {salt ? (
          <>
            <Path d="M60 160c-4-30 6-48 2-70M62 120c10-12 22-14 26-26M58 130c-10-8-20-10-24-22" stroke="#F472B6" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.75} />
            <Ellipse cx={300} cy={148} rx={34} ry={16} fill="#7C3AED" opacity={0.55} />
            <Circle cx={286} cy={134} r={7} fill="#A78BFA" opacity={0.7} />
            <Circle cx={306} cy={130} r={6} fill="#A78BFA" opacity={0.7} />
            <Circle cx={322} cy={138} r={5} fill="#A78BFA" opacity={0.7} />
            <Path d="M360 160c0-24 8-34 4-52M368 130c8-6 14-12 14-20" stroke="#22D3EE" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
          </>
        ) : (
          <>
            <Path d="M50 162c-6-40 10-70 0-110M58 162c8-30 24-44 18-80M40 162c-12-24-8-48-20-64M340 162c4-40-12-60-4-96M350 162c10-26 24-36 22-62" stroke="#22C55E" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
            <Path d="M280 162c-2-20 4-30 0-46" stroke="#4ADE80" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5} />
          </>
        )}
        <Path d="M0 156c60-10 120 6 200-2s140-8 200 2v12H0z" fill="#1d3a4a" />
      </Svg>
      {w ? fish.map((f, i) => <SwimFish key={type + i} width={w} top={f.top} color={f.c} size={f.s} duration={f.d} delay={f.dl} />) : null}
      {w ? [0.22, 0.5, 0.78].map((x, i) => <Bubble key={i} x={w * x} delay={i * 1300} height={h} />) : null}
      <View style={hs.tags}>{children}</View>
    </View>
  );
}
const hs = StyleSheet.create({
  wrap: { height: 168, overflow: "hidden", borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg },
  tags: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
});

/* ---------------- Metric pod with animated gauge ---------------- */
export function MetricPod({ m, value, type, index = 0 }: { m: Metric; value: number; type: TankType; index?: number }) {
  const j = judge(m, value, type);
  const r = j.range; // [okLo, okHi, watchLo, watchHi]
  const span = r[3] - r[2] || 1;
  const pos = Math.max(0, Math.min(1, (value - r[2]) / span));
  const okL = (r[0] - r[2]) / span, okW = (r[1] - r[0]) / span;
  const color = j.level === "ok" ? C.primaryHi : j.level === "warn" ? C.warn : C.crit;
  const [w, setW] = useState(0);
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(250 + index * 70, withSpring(pos, { damping: 16, stiffness: 90 })); }, [pos]);
  const dot = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * Math.max(0, w - 8) }] }));
  return (
    <View style={ms.pod}>
      <View style={ms.top}>
        <Text style={T.label} numberOfLines={1}>{m.label}</Text>
        <Badge text={j.label} tone={j.level === "ok" ? "ok" : j.level} dot pulse={j.level !== "ok"} />
      </View>
      <Text style={[ms.val, { color }]}>
        {value.toFixed(m.dec)}
        {m.unit ? <Text style={ms.unit}> {m.unit}</Text> : null}
      </Text>
      <View style={ms.track} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <View style={[ms.okZone, { left: `${okL * 100}%`, width: `${okW * 100}%` }]} />
        <Animated.View style={[ms.dot, { backgroundColor: color }, dot]} />
      </View>
      <Text style={ms.tgt}>Target {r[0]} – {r[1]}{m.unit ? " " + m.unit : ""}</Text>
    </View>
  );
}
const ms = StyleSheet.create({
  pod: { flexBasis: "47%", flexGrow: 1, backgroundColor: C.s, borderColor: C.hair, borderWidth: 1, borderRadius: R.lg, padding: 12, gap: 8 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" },
  val: { fontFamily: F.head700, fontSize: 27, letterSpacing: -0.5 },
  unit: { fontFamily: F.body500, fontSize: 12, color: C.muted, letterSpacing: 0 },
  track: { height: 8, justifyContent: "center" },
  okZone: { position: "absolute", height: 4, borderRadius: 2, backgroundColor: "rgba(16,185,129,0.35)" },
  dot: { width: 8, height: 8, borderRadius: 4, position: "absolute", left: 0 },
  tgt: { fontFamily: F.mono, fontSize: 11, color: C.muted },
});

export function MetricGrid({ readings, type, metrics }: { readings: Record<string, number>; type: TankType; metrics: Metric[] }) {
  const shown = metrics.filter((m) => readings[m.id] != null && !isNaN(readings[m.id]));
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {shown.map((m, i) => <MetricPod key={m.id} m={m} value={Number(readings[m.id])} type={type} index={i} />)}
    </View>
  );
}

/* ---------------- Bottom tab bar ---------------- */
export type TabId = "tanks" | "book" | "history" | "livestock" | "pro";
export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "tanks", label: "Tanks", icon: "waves" },
  { id: "book", label: "Book", icon: "cal" },
  { id: "history", label: "History", icon: "clock" },
  { id: "livestock", label: "Livestock", icon: "fish" },
  { id: "pro", label: "Pro jobs", icon: "pro" },
];

function TabItem({ tab, active, onPress, badge }: { tab: (typeof TABS)[number]; active: boolean; onPress: () => void; badge?: number }) {
  const s = useSharedValue(active ? 1 : 0);
  useEffect(() => { s.value = withSpring(active ? 1 : 0, SPRING); }, [active]);
  const icon = useAnimatedStyle(() => ({ transform: [{ scale: 1 + s.value * 0.12 }, { translateY: -s.value * 2 }] }));
  return (
    <Pressable onPress={onPress} style={ts.item} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label}>
      <Animated.View style={icon}>
        <Icon name={tab.icon} size={22} color={active ? C.primary : C.muted} />
        {badge ? <View style={ts.badge}><Text style={ts.badgeText}>{badge}</Text></View> : null}
      </Animated.View>
      <Text style={[ts.label, active && { color: C.primary, fontFamily: F.body600 }]} numberOfLines={1}>{tab.label}</Text>
    </Pressable>
  );
}

export function TabBar({ value, onChange, badges }: { value: TabId; onChange: (t: TabId) => void; badges?: Partial<Record<TabId, number>> }) {
  const ins = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const idx = TABS.findIndex((t) => t.id === value);
  const itemW = w / TABS.length;
  const x = useSharedValue(0);
  useEffect(() => { if (itemW) x.value = withSpring(idx * itemW + itemW / 2 - 16, SPRING); }, [idx, itemW]);
  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={[ts.bar, { paddingBottom: Math.max(ins.bottom, 8) }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(6,20,38,0.82)" }]} />
      <View style={ts.row} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {itemW ? <Animated.View style={[ts.ind, ind]} /> : null}
        {TABS.map((t) => (
          <TabItem key={t.id} tab={t} active={t.id === value} badge={badges?.[t.id]} onPress={() => { if (t.id !== value) { haptic.tap(); onChange(t.id); } }} />
        ))}
      </View>
    </View>
  );
}
const ts = StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: C.line, overflow: "hidden" },
  row: { flexDirection: "row", paddingTop: 8, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 4 },
  label: { fontFamily: F.body500, fontSize: 11, color: C.muted },
  ind: { position: "absolute", top: 0, left: 6, width: 32, height: 3, borderRadius: 2, backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  badge: { position: "absolute", right: -8, top: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.tertiary, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { fontFamily: F.body600, fontSize: 10, color: C.onPrimary },
});

/* ---------------- Bottom sheet ---------------- */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  // The container stays mounted so the backdrop and panel can play their exit animations.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? "auto" : "box-none"}>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
      ) : null}
      {open ? (
        <Animated.View entering={SlideInDown.springify().damping(20).stiffness(180)} exiting={SlideOutDown.duration(220)} style={[sh.panel, { paddingBottom: ins.bottom + 20 }]}>
          <View style={sh.handle} />
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}
const sh = StyleSheet.create({
  panel: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.s, borderTopLeftRadius: R.xl + 6, borderTopRightRadius: R.xl + 6, borderWidth: 1, borderColor: C.primary, padding: 20, gap: 14,
    shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 48, shadowOffset: { width: 0, height: -10 }, elevation: 20 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: 4 },
});
