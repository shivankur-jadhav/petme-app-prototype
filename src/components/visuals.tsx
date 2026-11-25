// Animated visuals: metric pods with range gauges, the bottom tab bar and the bottom sheet.
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

type Transform = NonNullable<ViewStyle["transform"]>;
import Animated, {
  FadeIn, FadeOut, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withDelay, withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, SPRING, T, isDark, themed } from "../theme";
import { Icon } from "./Icon";
import { Badge, haptic } from "./ui";
import { Metric, TankType, chemOf, judge } from "../data";

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
const ms = themed(() => StyleSheet.create({
  pod: { flexBasis: "47%", flexGrow: 1, backgroundColor: C.s, borderColor: C.hair, borderWidth: 1, borderRadius: R.lg, padding: 12, gap: 8 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" },
  val: { fontFamily: F.head700, fontSize: 27, letterSpacing: -0.5 },
  unit: { fontFamily: F.body500, fontSize: 12, color: C.muted, letterSpacing: 0 },
  track: { height: 8, justifyContent: "center" },
  okZone: { position: "absolute", height: 4, borderRadius: 2, backgroundColor: "rgba(16,185,129,0.35)" },
  dot: { width: 8, height: 8, borderRadius: 4, position: "absolute", left: 0 },
  tgt: { fontFamily: F.mono, fontSize: 11, color: C.muted },
}));

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
  { id: "livestock", label: "Livestock", icon: "clown" },
  { id: "pro", label: "Pro jobs", icon: "pro" },
];

function TabItem({ tab, active, onPress, badge }: { tab: (typeof TABS)[number]; active: boolean; onPress: () => void; badge?: number }) {
  const s = useSharedValue(active ? 1 : 0);
  useEffect(() => { s.value = withSpring(active ? 1 : 0, SPRING); }, [active]);
  const icon = useAnimatedStyle(() => ({ transform: [{ scale: 1 + s.value * 0.12 }, { translateY: -s.value * 2 }] as Transform }));
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
      <BlurView intensity={40} tint={isDark() ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.tabBg }]} />
      <View style={ts.row} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {itemW ? <Animated.View style={[ts.ind, ind]} /> : null}
        {TABS.map((t) => (
          <TabItem key={t.id} tab={t} active={t.id === value} badge={badges?.[t.id]} onPress={() => { if (t.id !== value) { haptic.tap(); onChange(t.id); } }} />
        ))}
      </View>
    </View>
  );
}
const ts = themed(() => StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: C.line, overflow: "hidden" },
  row: { flexDirection: "row", paddingTop: 8, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 4 },
  label: { fontFamily: F.body500, fontSize: 11, color: C.muted },
  ind: { position: "absolute", top: 0, left: 6, width: 32, height: 3, borderRadius: 2, backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  badge: { position: "absolute", right: -8, top: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.tertiary, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { fontFamily: F.body600, fontSize: 10, color: C.onPrimary },
}));

/* ---------------- Bottom sheet ---------------- */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  // The container stays mounted so the backdrop and panel can play their exit animations.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? "auto" : "box-none"}>
      {open ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]}>
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
const sh = themed(() => StyleSheet.create({
  panel: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.s, borderTopLeftRadius: R.xl + 6, borderTopRightRadius: R.xl + 6, borderWidth: 1, borderColor: C.primary, padding: 20, gap: 14,
    shadowColor: C.shadow, shadowOpacity: isDark() ? 0.6 : 0.18, shadowRadius: 48, shadowOffset: { width: 0, height: -10 }, elevation: 20 },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: 4 },
}));
