import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { C, F, R, T } from "../theme";
import { Icon } from "../components/Icon";
import { Badge, Btn, Check, Chips, Field, Label, Ledger, Panel, Press, Screen, SecHeader, Segmented, Title, haptic, layout } from "../components/ui";
import { useStore } from "../store";
import {
  ALL_IDEAS, CITIES, RECUR, SERVICES, SIZES, TYPES, WINDOWS, by, dateOptions, fmtDate, fmtDur, makeBooking, money, money0, quote,
  RecurId, ServiceId, SizeId, TankType,
} from "../data";

export default function BookScreen({ showSheet, closeSheet, openReport }: { showSheet: (n: React.ReactNode) => void; closeSheet: () => void; openReport: (id: string) => void }) {
  const { tank, setTank, wish, clearWish, addBooking } = useStore();
  const [service, setService] = useState<ServiceId>("clean");
  const [recur, setRecur] = useState<RecurId>("w4");
  const [city, setCity] = useState("Toronto");
  const [date, setDate] = useState("");
  const [win, setWin] = useState("am");
  const [notes, setNotes] = useState("");
  const [sms, setSms] = useState(true);
  const [away, setAway] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const days = useMemo(() => dateOptions(service), [service]);
  useEffect(() => { if (date && !days.some((d) => d.id === date)) setDate(""); }, [days]);
  const q = quote({ service, type: tank.type, size: tank.size, recur, city });
  const wishItems = wish.map((id) => by(ALL_IDEAS, id)).filter(Boolean);

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const fail = (msg: string) => {
    setErr(msg); haptic.error();
    shake.value = withSequence(withTiming(-8, { duration: 50 }), withRepeat(withTiming(8, { duration: 80 }), 4, true), withTiming(0, { duration: 50 }));
  };

  const submit = () => {
    if (!date) return fail("Pick a day for the visit.");
    if (!name.trim()) return fail("Add your name.");
    if (phone.replace(/\D/g, "").length < 7) return fail("Add a phone number we can reach you on.");
    setErr("");
    const b = makeBooking(
      { service, type: tank.type, size: tank.size, recur, city, date, win, tankName: tank.name },
      { name: name.trim(), phone: phone.trim(), notes: (notes.trim() + (away ? " (Customer may not be home.)" : "")).trim(), sms, wishlist: wishItems.map((i) => i!.name) }
    );
    addBooking(b); clearWish(); haptic.success();
    setDate(""); setNotes(""); setAway(false);
    showSheet(
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Label color={C.primary}>Request received</Label>
          <Badge text="Requested" tone="tert" dot pulse />
        </View>
        <Animated.View entering={ZoomIn.delay(120).springify().damping(12)} style={{ alignSelf: "center", width: 72, height: 72, borderRadius: 36, backgroundColor: C.primaryTint, borderWidth: 1, borderColor: C.primary, alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={34} color={C.primary} width={2.6} />
        </Animated.View>
        <Text style={[T.h1, { fontFamily: F.mono, textAlign: "center" }]}>{b.ref}</Text>
        <Text style={[T.body, { textAlign: "center" }]}>{by(SERVICES, b.service)!.name} on {fmtDate(b.date)}, {by(WINDOWS, b.win)!.name}, in {b.city}.</Text>
        <Text style={[T.small, { textAlign: "center" }]}>We will confirm your arrival window by text or phone.</Text>
        <Btn label="View visit details" onPress={() => { closeSheet(); openReport(b.id); }} />
        <Btn label="Done" kind="sec" onPress={closeSheet} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen>
        <Title eyebrow="Book service" title="Schedule a tank visit" sub="Toronto and the GTA. Starter prices for this prototype, in CAD." />

        <Panel index={1}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Label>Tank for this visit</Label>
            <Badge text={tank.sample ? "Sample profile" : "Saved"} tone={tank.sample ? "slate" : "cyan"} dashed={tank.sample} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}><Icon name="tank" color={C.tertiary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={T.h3}>{tank.name}</Text>
              <Text style={T.small}>{by(TYPES, tank.type)!.name} · {by(SIZES, tank.size)!.name} gal</Text>
            </View>
          </View>
          <Segmented items={TYPES.map((t) => ({ id: t.id, label: t.short }))} value={tank.type} onChange={(id: TankType) => setTank({ ...tank, type: id })} />
          <Segmented items={SIZES.map((s) => ({ id: s.id, label: s.short, sub: "gal" }))} value={tank.size} onChange={(id: SizeId) => setTank({ ...tank, size: id })} />
        </Panel>

        <Panel index={2}>
          <SecHeader title="Select service" right={<Label>Priced for your tank</Label>} />
          {SERVICES.map((s) => {
            const on = s.id === service;
            const price = quote({ service: s.id, type: tank.type, size: tank.size, recur: "once", city: "Toronto" }).base;
            return (
              <Press key={s.id} scaleTo={0.985} onPress={() => setService(s.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={{ gap: 10, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: on ? C.primary : C.line, backgroundColor: on ? "rgba(30,62,98,0.45)" : C.glass }}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <View style={{ marginTop: 2 }}><Icon name={s.icon} color={C.tertiary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={T.h3}>{s.name}</Text>
                    <Text style={T.small}>{s.tag}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: on ? C.tertiary : "#3b4949", backgroundColor: on ? C.tertiary : C.sTop, alignItems: "center", justifyContent: "center" }}>
                    {on ? <Animated.View entering={ZoomIn.springify().damping(12)}><Icon name="check" size={13} color={C.onPrimary} width={3} /></Animated.View> : null}
                  </View>
                </View>
                {on ? <Animated.Text entering={FadeIn.duration(200)} style={T.body2}>{s.blurb}</Animated.Text> : null}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="clock" size={15} color={C.muted} /><Text style={T.small}>~{fmtDur(s.hours[tank.size])}</Text></View>
                  <Animated.Text key={price} entering={FadeInDown.springify().damping(16)} style={{ fontFamily: F.head700, fontSize: 18, color: C.ink }}>{money0(price)}</Animated.Text>
                </View>
              </Press>
            );
          })}
        </Panel>

        {service === "clean" ? (
          <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOut.duration(150)} layout={layout}>
            <Panel>
              <SecHeader title="Maintenance plan" right={<Label color={C.primary}>Saves on every visit</Label>} />
              <Segmented<RecurId> items={RECUR.map((r) => ({ id: r.id, label: r.name, sub: r.sub }))} value={recur} onChange={setRecur} />
            </Panel>
          </Animated.View>
        ) : null}

        <Panel index={3}>
          <SecHeader title="Service window" right={<Label color={date ? C.primary : C.muted}>{date ? fmtDate(date) : "Pick a day"}</Label>} />
          <Label>City</Label>
          <Chips items={Object.keys(CITIES).map((c) => ({ id: c, label: c + (CITIES[c] === "A" ? "" : CITIES[c] === "B" ? " · +$25" : " · +$45") }))} value={city} onChange={setCity} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {days.map((d) => {
              const on = d.id === date;
              return (
                <Press key={d.id} onPress={() => { setDate(d.id); setErr(""); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={fmtDate(d.id)}
                  style={{ width: 60, alignItems: "center", gap: 2, paddingVertical: 9, borderRadius: R.md, borderWidth: 1, borderColor: on ? C.primary : C.line2, backgroundColor: on ? C.secondary : C.sLow }}>
                  <Text style={[T.label, on && { color: C.primary }]}>{d.dw}</Text>
                  <Text style={{ fontFamily: F.head600, fontSize: 21, color: C.ink }}>{d.dn}</Text>
                  <Text style={[T.small, { fontSize: 10 }]}>{d.dm}</Text>
                </Press>
              );
            })}
          </ScrollView>
          {WINDOWS.map((w) => {
            const on = w.id === win;
            return (
              <Press key={w.id} scaleTo={0.985} onPress={() => setWin(w.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: on ? C.primary : C.line2, backgroundColor: on ? "rgba(30,62,98,0.4)" : C.sLow }}>
                <Icon name={w.icon} color={C.tertiary} />
                <View style={{ flex: 1 }}><Text style={T.h3}>{w.name}</Text><Text style={T.small}>{w.sub}</Text></View>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: on ? C.tertiary : "#3b4949", backgroundColor: on ? C.tertiary : C.sTop }} />
              </Press>
            );
          })}
        </Panel>

        <Panel index={4}>
          <SecHeader title="Notes for your technician" right={<Label>Optional</Label>} />
          <Field label="Field notes" value={notes} onChangeText={setNotes} multiline placeholder="Recent fish losses, parking, gate codes, stairs, equipment issues..." />
          {wishItems.length ? (
            <Animated.View entering={FadeIn} style={{ gap: 6 }}>
              <Label>Fish to discuss at this visit</Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{wishItems.map((i) => <Badge key={i!.id} text={i!.name} tone="tert" />)}</View>
            </Animated.View>
          ) : null}
          <Check label="Text me when the technician is 15 minutes away" value={sms} onChange={setSms} />
          <Check label="I may not be home. I will leave access instructions in the notes" value={away} onChange={setAway} />
        </Panel>

        <Panel index={5}>
          <Text style={T.h2}>Your details</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Field label="Name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
          </View>
        </Panel>

        <Panel index={6} flat>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Label>Billing summary</Label>
            {service === "clean" && recur !== "once" ? <Label color={C.primary}>{by(RECUR, recur)!.name}</Label> : null}
          </View>
          <Ledger
            rows={[
              [`Service: ${q.svc.name}`, money(q.base)],
              ...(q.discAmt ? [["Plan discount", money(-q.discAmt), true] as [string, string, boolean]] : []),
              ...(q.travel ? [[`Travel, zone ${q.zone}`, money(q.travel)] as [string, string]] : []),
              ["HST 13%", money(q.tax)],
            ]}
            totalLabel={q.monthly ? "Per visit" : "Due after visit"}
            totalSub={q.monthly ? `About ${money(q.monthly)} per month on this plan` : "Paid once the work is done"}
            total={money(q.total)}
          />
        </Panel>

        <Animated.View style={shakeStyle}>
          <Btn label="Confirm and request visit" icon="cal" onPress={submit} />
        </Animated.View>
        {err ? <Animated.Text entering={FadeIn} style={{ color: C.crit, fontFamily: F.body500, textAlign: "center", marginTop: -6 }}>{err}</Animated.Text> : null}
        <Text style={[T.small, { textAlign: "center", marginTop: -6 }]}>No payment now. You pay after the visit is done.</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
