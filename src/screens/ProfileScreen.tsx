import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, SlideInRight, SlideOutRight, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, T, ThemePref, themed } from "../theme";
import { Icon } from "../components/Icon";
import { Badge, Btn, Check, Chips, Field, Label, Panel, Press, SecHeader, Segmented, enter, haptic } from "../components/ui";
import { TabId } from "../components/visuals";
import { useStore } from "../store";
import { CITIES, Profile, SIZES, TYPES, by, initials, money0, paidSoFar, phoneOk, validEmail, validPostal } from "../data";

// Field is built for rows (flex: 1). Fields stacked straight in a panel size to their content instead.
const COL = { flexGrow: 0, flexShrink: 0, flexBasis: "auto" } as const;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ProfileScreen({ onClose, go }: { onClose: () => void; go: (t: TabId) => void }) {
  const { profile, setProfile, bookings, tank, toast, themePref, setThemePref } = useStore();
  const ins = useSafeAreaInsets();
  const [d, setD] = useState<Profile>(profile);
  const [err, setErr] = useState("");
  const set = (p: Partial<Profile>) => { setD((prev) => ({ ...prev, ...p })); setErr(""); };
  const dirty = (Object.keys(d) as (keyof Profile)[]).some((k) => k !== "since" && d[k] !== profile[k]);

  const real = bookings.filter((b) => !b.example);
  const done = real.filter((b) => b.status === "done").length;
  const upcoming = real.filter((b) => b.status === "new" || b.status === "confirmed").length;
  const paid = real.reduce((s, b) => s + paidSoFar(b), 0);
  const first = Math.min(profile.since || Infinity, ...real.map((b) => b.createdAt || Infinity));
  const since = Number.isFinite(first) ? `Customer since ${MON[new Date(first).getMonth()]} ${new Date(first).getFullYear()}` : "New customer";

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const fail = (msg: string) => {
    setErr(msg); haptic.error();
    shake.value = withSequence(withTiming(-8, { duration: 50 }), withRepeat(withTiming(8, { duration: 80 }), 4, true), withTiming(0, { duration: 50 }));
  };
  const save = () => {
    if (d.phone.trim() && !phoneOk(d.phone)) return fail("That phone number looks too short.");
    if (d.email.trim() && !validEmail(d.email)) return fail("Check the email address.");
    if (d.postal.trim() && !validPostal(d.postal)) return fail("Postal codes look like M5V 2T6.");
    const clean = { ...d, name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), street: d.street.trim(), unit: d.unit.trim(), postal: d.postal.trim().toUpperCase(), access: d.access.trim() };
    setProfile(clean); setD(clean);
    haptic.success(); toast("Profile saved.");
  };

  const mono = initials(d.name);
  return (
    <Animated.View entering={SlideInRight.springify().damping(22).stiffness(200)} exiting={SlideOutRight.duration(220)} style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: ins.bottom + 112, gap: 16 }}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Press onPress={onClose} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 }} accessibilityLabel="Back">
              <Icon name="back" size={18} color={C.primary} /><Text style={{ color: C.primary, fontFamily: F.body500, fontSize: 15 }}>Back</Text>
            </Press>
            {profile.since ? <Badge text="Saved" tone="cyan" /> : <Badge text="Not set up" tone="slate" dashed />}
          </View>

          <Animated.View entering={enter(0)} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={s.avatar}>
              {mono
                ? <Animated.Text key={mono} entering={FadeIn.duration(200)} style={{ fontFamily: F.head700, fontSize: 24, color: C.primaryHi }}>{mono}</Animated.Text>
                : <Icon name="user" size={28} color={C.primary} />}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Label color={C.primary}>Your profile</Label>
              <Text style={T.h1} numberOfLines={1}>{d.name.trim() || "Add your name"}</Text>
              <Text style={T.small}>{since}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={enter(1)} style={{ flexDirection: "row", gap: 10 }}>
            {[[String(done), "Visits done"], [String(upcoming), "Upcoming"], [money0(paid), "Paid so far"]].map(([v, l]) => (
              <View key={l} style={s.stat}>
                <Animated.Text key={v} entering={FadeIn.duration(300)} style={{ fontFamily: F.head700, fontSize: 22, color: C.primaryHi }}>{v}</Animated.Text>
                <Text style={T.small}>{l}</Text>
              </View>
            ))}
          </Animated.View>

          <Panel index={2}>
            <SecHeader title="Contact" icon="user" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Field label="Name" value={d.name} onChangeText={(v) => set({ name: v })} autoComplete="name" textContentType="name" />
              <Field label="Phone" value={d.phone} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
            </View>
            <Field label="Email" value={d.email} onChangeText={(v) => set({ email: v })} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="For visit reports and receipts" style={COL} />
          </Panel>

          <Panel index={3}>
            <SecHeader title="Service address" icon="pin" right={<Label>Used for bookings</Label>} />
            <Field label="Street address" value={d.street} onChangeText={(v) => set({ street: v })} autoComplete="street-address" textContentType="streetAddressLine1" placeholder="123 Queen St W" style={COL} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <Field label="Unit" value={d.unit} onChangeText={(v) => set({ unit: v })} placeholder="Optional" style={{ minWidth: 100 }} />
              <Field label="Postal code" value={d.postal} onChangeText={(v) => set({ postal: v })} autoCapitalize="characters" autoComplete="postal-code" textContentType="postalCode" placeholder="M5V 2T6" style={{ minWidth: 100 }} />
            </View>
            <Label>City</Label>
            <Chips items={Object.keys(CITIES).map((c) => ({ id: c, label: c }))} value={d.city} onChange={(v) => set({ city: v })} />
            <Field label="Access notes" value={d.access} onChangeText={(v) => set({ access: v })} multiline placeholder="Buzzer code, parking, stairs, pets at home..." style={COL} />
          </Panel>

          <Panel index={4}>
            <SecHeader title="Notifications" icon="signal" />
            <Check label="Text me when the technician is 15 minutes away" value={d.smsEta} onChange={(v) => set({ smsEta: v })} />
            <Check label="Remind me the day before a visit" value={d.reminders} onChange={(v) => set({ reminders: v })} />
          </Panel>

          <Panel index={5}>
            <SecHeader title="Appearance" icon="sun" right={<Label>Saved right away</Label>} />
            <Segmented<ThemePref> items={[{ id: "system", label: "System", sub: "Match phone" }, { id: "light", label: "Light" }, { id: "dark", label: "Dark" }]} value={themePref} onChange={setThemePref} />
          </Panel>

          <Panel index={6}>
            <SecHeader title="Your tank" icon="tank" right={tank.sample ? <Badge text="Sample profile" tone="slate" dashed /> : null} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={T.h3}>{tank.name}</Text>
                <Text style={T.small}>{by(TYPES, tank.type)!.name} · {by(SIZES, tank.size)!.name} gal</Text>
              </View>
              <Btn small kind="sec" label="Edit tank" onPress={() => { onClose(); go("tanks"); }} />
            </View>
          </Panel>

          <Animated.View style={shakeStyle}>
            <Btn label={dirty ? "Save profile" : "All changes saved"} icon="check" kind={dirty ? "primary" : "sec"} disabled={!dirty} onPress={save} />
          </Animated.View>
          {err ? <Animated.Text entering={FadeIn} style={{ color: C.crit, fontFamily: F.body500, textAlign: "center", marginTop: -6 }}>{err}</Animated.Text> : null}
          <Text style={[T.small, { textAlign: "center", marginTop: -6 }]}>Saved on this phone. Your details fill in each booking for you.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const s = themed(() => StyleSheet.create({
  avatar: { width: 64, height: 64, borderRadius: R.lg, backgroundColor: C.sTop, borderWidth: 1, borderColor: C.primary, alignItems: "center", justifyContent: "center" },
  stat: { flex: 1, backgroundColor: C.s, borderWidth: 1, borderColor: C.hair, borderRadius: R.lg, padding: 12 },
}));
