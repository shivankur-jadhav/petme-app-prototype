// Shared building blocks. Every press springs and gives a light haptic so the app feels physical.
import React, { useEffect, useState } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import Animated, {
  FadeInDown, FadeOutDown, LinearTransition, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming, ZoomIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, SPRING, T } from "../theme";
import { Icon } from "./Icon";
import { useStore } from "../store";
import { initials } from "../data";

export const haptic = {
  tap: () => { Haptics.selectionAsync().catch(() => {}); },
  soft: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  success: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  error: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); },
};

/** Staggered entrance used across screens: item i arrives 55ms after item i-1. */
export const enter = (i = 0) => FadeInDown.delay(Math.min(i, 10) * 55).springify().damping(18).stiffness(170);
export const layout = LinearTransition.springify().damping(20).stiffness(180);

const APressable = Animated.createAnimatedComponent(Pressable);

export function Press({
  onPress, style, children, disabled, scaleTo = 0.97, feedback = "tap", accessibilityLabel, accessibilityRole = "button", accessibilityState,
}: {
  onPress?: () => void; style?: StyleProp<ViewStyle>; children?: React.ReactNode; disabled?: boolean; scaleTo?: number;
  feedback?: "tap" | "soft" | "none"; accessibilityLabel?: string; accessibilityRole?: any; accessibilityState?: any;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      onPressIn={() => { s.value = withSpring(scaleTo, SPRING); }}
      onPressOut={() => { s.value = withSpring(1, SPRING); }}
      onPress={() => { if (feedback === "tap") haptic.tap(); else if (feedback === "soft") haptic.soft(); onPress && onPress(); }}
      style={[style as any, a, disabled ? { opacity: 0.45 } : null]}
    >
      {children}
    </APressable>
  );
}

export function Panel({ children, style, flat, index, entering }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; flat?: boolean; index?: number; entering?: any }) {
  return (
    <Animated.View entering={entering || (index != null ? enter(index) : undefined)} layout={layout} style={[st.panel, flat && st.flat, style]}>
      {children}
    </Animated.View>
  );
}

export function Label({ children, color, style }: { children: React.ReactNode; color?: string; style?: any }) {
  return <Text style={[T.label, color ? { color } : null, style]}>{children}</Text>;
}

export function SecHeader({ title, icon, right }: { title: string; icon?: string; right?: React.ReactNode }) {
  return (
    <View style={st.secH}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
        {icon ? <Icon name={icon} color={C.primary} /> : null}
        <Text style={T.h2}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function PulseDot({ color, pulse = true, size = 6 }: { color: string; pulse?: boolean; size?: number }) {
  const o = useSharedValue(1);
  useEffect(() => {
    if (pulse) o.value = withRepeat(withSequence(withTiming(0.25, { duration: 900 }), withTiming(1, { duration: 900 })), -1);
  }, [pulse]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size, backgroundColor: color }, a]} />;
}

const TONES: Record<string, [string, string, string]> = {
  cyan: [C.primary, C.primaryTint, "rgba(0,210,211,0.35)"],
  ok: [C.ok, C.okTint, "rgba(16,185,129,0.35)"],
  warn: [C.warn, C.warnTint, "rgba(245,158,11,0.35)"],
  crit: [C.crit, C.critTint, "rgba(244,63,94,0.35)"],
  tert: [C.tertiary, C.tertTint, "rgba(56,189,248,0.35)"],
  slate: [C.muted, "rgba(148,163,184,0.08)", C.line2],
};
export function Badge({ text, tone = "cyan", dot, pulse, dashed }: { text: string; tone?: string; dot?: boolean; pulse?: boolean; dashed?: boolean }) {
  const [fg, bg, bd] = TONES[tone] || TONES.cyan;
  return (
    <View style={[st.badge, { backgroundColor: dashed ? "transparent" : bg, borderColor: bd, borderStyle: dashed ? "dashed" : "solid" }]}>
      {dot ? <PulseDot color={fg} pulse={pulse} /> : null}
      <Text style={[st.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Btn({
  label, onPress, kind = "primary", icon, small, block, disabled,
}: { label: string; onPress?: () => void; kind?: "primary" | "sec" | "ghost" | "danger" | "plain"; icon?: string; small?: boolean; block?: boolean; disabled?: boolean }) {
  const k = {
    primary: { bg: C.primary, fg: C.onPrimary, bd: C.primary },
    sec: { bg: "transparent", fg: C.primary, bd: "rgba(0,210,211,0.4)" },
    ghost: { bg: C.sHigh, fg: C.primary, bd: "transparent" },
    danger: { bg: "rgba(244,63,94,0.08)", fg: C.crit, bd: "rgba(244,63,94,0.5)" },
    plain: { bg: "transparent", fg: C.muted, bd: "transparent" },
  }[kind];
  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      feedback={kind === "primary" ? "soft" : "tap"}
      accessibilityLabel={label}
      style={[
        st.btn, small && st.btnSm, block && { alignSelf: "stretch" },
        { backgroundColor: k.bg, borderColor: k.bd },
        kind === "primary" && st.glow,
      ]}
    >
      {icon ? <Icon name={icon} size={small ? 15 : 17} color={k.fg} width={2} /> : null}
      <Text style={[st.btnText, small && { fontSize: 13 }, { color: k.fg }]}>{label}</Text>
    </Press>
  );
}

/** Segmented control with a glass pill that springs to the selected option. */
export function Segmented<T extends string>({ items, value, onChange }: { items: { id: T; label: string; sub?: string }[]; value: T; onChange: (id: T) => void }) {
  const [w, setW] = useState(0);
  const n = items.length;
  const idx = Math.max(0, items.findIndex((i) => i.id === value));
  const seg = w ? (w - 6) / n : 0;
  const x = useSharedValue(0);
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    if (!seg) return;
    if (!placed) { x.value = idx * seg; setPlaced(true); } else x.value = withSpring(idx * seg, SPRING);
  }, [idx, seg]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={st.seg} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="radiogroup">
      {seg ? <Animated.View style={[st.segPill, { width: seg }, pill]} /> : null}
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable
            key={it.id}
            style={st.segItem}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => { if (!on) { haptic.tap(); onChange(it.id); } }}
          >
            <Text style={[st.segText, on && { color: C.ink, fontFamily: F.body600 }]} numberOfLines={1}>{it.label}</Text>
            {it.sub ? <Text style={st.segSub} numberOfLines={1}>{it.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Press key={it.id} onPress={() => onChange(it.id)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[st.chip, on && { backgroundColor: C.tertiary, borderColor: C.tertiary }]}>
            <Text style={[st.chipText, on && { color: C.onPrimary, fontFamily: F.body600 }]}>{it.label}</Text>
          </Press>
        );
      })}
    </Animated.ScrollView>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string; style?: any }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 6, flex: 1, minWidth: 140 }, style]}>
      <Text style={st.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={C.faint}
        selectionColor={C.primary}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[st.input, props.multiline && { minHeight: 88, textAlignVertical: "top" }, focus && { borderColor: C.primary }]}
        {...props}
      />
    </View>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Press onPress={() => onChange(!value)} scaleTo={0.99} accessibilityRole="checkbox" accessibilityState={{ checked: value }} style={st.check}>
      <View style={[st.box, value && { backgroundColor: C.primary, borderColor: C.primary }]}>
        {value ? <Animated.View entering={ZoomIn.springify().damping(14)}><Icon name="check" size={13} color={C.onPrimary} width={3} /></Animated.View> : null}
      </View>
      <Text style={[T.body2, { flex: 1, color: C.ink }]}>{label}</Text>
    </Press>
  );
}

export function Ledger({ rows, totalLabel, totalSub, total }: { rows: [string, string, boolean?][]; totalLabel: string; totalSub?: string; total: string }) {
  return (
    <View style={{ gap: 8 }}>
      {rows.map(([a, b, disc], i) => (
        <View key={i} style={st.lrow}>
          <Text style={[st.mono, disc && { color: C.tertiary }, { flex: 1 }]} numberOfLines={1}>{a}</Text>
          <Text style={[st.mono, disc && { color: C.tertiary }]}>{b}</Text>
        </View>
      ))}
      <View style={st.ltot}>
        <View style={{ flex: 1 }}>
          <Text style={T.h3}>{totalLabel}</Text>
          {totalSub ? <Text style={T.small}>{totalSub}</Text> : null}
        </View>
        <Animated.Text key={total} entering={FadeInDown.springify().damping(16)} style={st.ltotAmt}>{total}</Animated.Text>
      </View>
    </View>
  );
}

export function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <Animated.View entering={enter(1)} style={st.empty}>
      <Text style={T.h2}>{title}</Text>
      <Text style={T.body2}>{text}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>
    </Animated.View>
  );
}

export function AppBar() {
  const { bookings, profile, setProfileOpen } = useStore();
  const mono = initials(profile.name);
  const open = bookings.filter((b) => b.status === "new" || b.status === "confirmed").length;
  return (
    <View style={st.appbar}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={st.mark}><Icon name="fish" color={C.primary} /></View>
        <View>
          <Text style={st.brand}>PetMe</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <PulseDot color={C.primary} />
            <Text style={[T.label, { fontSize: 9 }]}>{open ? `${open} visit${open > 1 ? "s" : ""} open` : "All clear"}</Text>
          </View>
        </View>
      </View>
      <Press onPress={() => setProfileOpen(true)} accessibilityRole="button" accessibilityLabel="Your profile" style={st.avatar}>
        <Text style={{ fontFamily: F.head600, color: C.ink }}>{mono || "Me"}</Text>
        {!profile.since ? <View style={st.avatarDot} /> : null}
      </Press>
    </View>
  );
}

export function Screen({ children, scrollRef }: { children: React.ReactNode; scrollRef?: any }) {
  const ins = useSafeAreaInsets();
  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: ins.top + 6, paddingHorizontal: 16, paddingBottom: ins.bottom + 112, gap: 16 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <AppBar />
      {children}
    </Animated.ScrollView>
  );
}

export function Title({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Animated.View entering={enter(0)} style={{ gap: 4 }}>
      <Label color={C.primary}>{eyebrow}</Label>
      <Text style={T.h1}>{title}</Text>
      {sub ? <Text style={T.small}>{sub}</Text> : null}
    </Animated.View>
  );
}

export function Toast() {
  const { toastMsg } = useStore();
  const ins = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: "flex-end", alignItems: "center", paddingBottom: ins.bottom + 92 }]}>
      {toastMsg ? (
        <Animated.View key={toastMsg.id} entering={FadeInDown.springify().damping(16)} exiting={FadeOutDown.duration(180)} style={st.toast}>
          <Icon name="check" size={16} color={C.primary} width={2.4} />
          <Text style={[T.body, { flexShrink: 1 }]}>{toastMsg.text}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

export const st = StyleSheet.create({
  panel: { backgroundColor: C.glass, borderColor: C.line, borderWidth: 1, borderRadius: R.lg, padding: 16, gap: 12 },
  flat: { backgroundColor: C.sLow },
  secH: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.sm, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontFamily: F.body600, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: R.sm, paddingVertical: 13, paddingHorizontal: 16 },
  btnSm: { paddingVertical: 8, paddingHorizontal: 12 },
  btnText: { fontFamily: F.body600, fontSize: 15 },
  glow: { shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  seg: { flexDirection: "row", backgroundColor: C.bg, borderColor: C.line2, borderWidth: 1, borderRadius: R.md, padding: 3 },
  segPill: { position: "absolute", top: 3, bottom: 3, left: 3, borderRadius: R.sm, backgroundColor: C.glass2, borderWidth: 1, borderColor: "rgba(0,210,211,0.45)" },
  segItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 2 },
  segText: { fontFamily: F.body500, fontSize: 13, color: C.ink2 },
  segSub: { fontFamily: F.body, fontSize: 10, color: C.muted, marginTop: 1 },
  chip: { borderWidth: 1, borderColor: C.line2, backgroundColor: C.sLow, borderRadius: R.sm, paddingHorizontal: 13, paddingVertical: 8 },
  chipText: { fontFamily: F.body500, fontSize: 13, color: C.ink2 },
  fieldLabel: { fontFamily: F.body500, fontSize: 12, color: C.ink2 },
  input: { backgroundColor: C.input, borderColor: C.line2, borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 11, color: C.white, fontFamily: F.body, fontSize: 15 },
  check: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.hair },
  box: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: C.line2, alignItems: "center", justifyContent: "center" },
  mono: { fontFamily: F.mono, fontSize: 13, color: C.ink },
  lrow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  ltot: { flexDirection: "row", alignItems: "flex-end", gap: 10, borderTopWidth: 1, borderTopColor: C.hair, paddingTop: 12, marginTop: 4 },
  ltotAmt: { fontFamily: F.mono, fontSize: 26, fontWeight: "600", color: C.ink },
  empty: { borderWidth: 1, borderStyle: "dashed", borderColor: C.line2, borderRadius: R.lg, padding: 20, gap: 10 },
  appbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 2 },
  mark: { width: 34, height: 34, borderRadius: 6, backgroundColor: C.sHigh, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  brand: { fontFamily: F.head700, fontSize: 19, color: C.primary },
  avatar: { width: 38, height: 38, borderRadius: 8, backgroundColor: C.sTop, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  avatarDot: { position: "absolute", right: -3, bottom: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: C.tertiary, borderWidth: 2, borderColor: C.bg },
  toast: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.sTop, borderColor: C.primary, borderWidth: 1, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 10, maxWidth: 360, marginHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
});
