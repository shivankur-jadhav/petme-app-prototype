import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { C, T } from "../theme";
import { Icon, CritterArt } from "../components/Icon";
import { Badge, Btn, Chips, Field, Label, Panel, Press, Screen, SecHeader, Segmented, enter, layout, st } from "../components/ui";
import { MetricGrid, TankHero, TabId } from "../components/visuals";
import { useStore } from "../store";
import { RECUR, SAMPLE_READINGS, SERVICES, SIZES, STOCK, TYPES, WINDOWS, by, chemOf, fmtDate, metricsFor, money, todayIso, SizeId, TankType } from "../data";

export default function TanksScreen({ go, openReport }: { go: (t: TabId) => void; openReport: (id: string) => void }) {
  const { tank, setTank, bookings, toast } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tank);
  const [filter, setFilter] = useState<"all" | "fish" | "inv">("all");

  const report = useMemo(() => bookings.filter((b) => b.status === "done" && b.results && Object.keys(b.results).length)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0], [bookings]);
  const next = useMemo(() => { const t = todayIso(); return bookings.filter((b) => (b.status === "new" || b.status === "confirmed") && b.date >= t).sort((a, b) => (a.date < b.date ? -1 : 1))[0]; }, [bookings]);

  const type = by(TYPES, tank.type)!;
  const size = by(SIZES, tank.size)!;
  const readings = report ? report.results! : SAMPLE_READINGS[chemOf(tank.type)];
  const rType = report ? report.type : tank.type;
  const stock = STOCK[chemOf(tank.type)];
  const fishN = stock.filter((s) => s.kind === "fish").length;
  const shown = stock.filter((s) => filter === "all" || s.kind === filter);

  return (
    <Screen>
      <Animated.View entering={enter(0)} layout={layout} style={[st.panel, { padding: 0, gap: 0, overflow: "hidden", backgroundColor: C.sLow }]}>
        <TankHero type={tank.type}>
          <Badge text="My tank" />
          {tank.sample ? <Badge text="Sample profile" tone="slate" dashed /> : null}
        </TankHero>
        <View style={{ padding: 16, gap: 4 }}>
          <Text style={[T.h1, { fontSize: 24 }]}>{tank.name}</Text>
          <Text style={T.small}>{type.name} · {size.name} gal</Text>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
            <Text style={T.small}>Plan <Text style={{ color: C.tertiary }}>{next && next.recur !== "once" ? by(RECUR, next.recur)!.name : "None yet"}</Text></Text>
            <Text style={T.small}>Last service <Text style={{ color: C.tertiary }}>{report ? fmtDate(report.date, false) : "None"}</Text></Text>
            <Press onPress={() => { setDraft(tank); setEditing(!editing); }} style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name={editing ? "close" : "edit"} size={15} color={C.muted} />
              <Text style={[T.small, { color: C.ink2 }]}>{editing ? "Close" : "Edit tank"}</Text>
            </Press>
          </View>
        </View>
      </Animated.View>

      {editing ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)} layout={layout} style={st.panel}>
          <Text style={T.h2}>Edit tank</Text>
          <Field label="Tank name" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
          <Label>Water type</Label>
          <Segmented items={TYPES.map((t) => ({ id: t.id, label: t.short }))} value={draft.type} onChange={(id: TankType) => setDraft({ ...draft, type: id })} />
          <Label>Size (gallons)</Label>
          <Segmented items={SIZES.map((s) => ({ id: s.id, label: s.short }))} value={draft.size} onChange={(id: SizeId) => setDraft({ ...draft, size: id })} />
          <Btn label="Save tank" onPress={() => { setTank({ ...draft, name: draft.name.trim() || "My tank", sample: false }); setEditing(false); toast("Tank saved."); }} />
        </Animated.View>
      ) : null}

      <Panel index={1}>
        <SecHeader title="Water test results" icon="signal" right={<Label color={C.primary}>{report ? "Logged by technician" : "Sample readings"}</Label>} />
        <MetricGrid readings={readings} type={rType} metrics={metricsFor(rType)} />
        <Text style={T.small}>
          {report ? `Measured on ${fmtDate(report.date)} during visit ${report.ref}.` : "Your technician logs real readings at every visit. These sample numbers show how they will appear."}
        </Text>
      </Panel>

      <Panel index={2}>
        <SecHeader title="Next visit" icon="clock" right={next ? <Badge text={next.status === "new" ? "Requested" : "Confirmed"} tone={next.status === "new" ? "tert" : "cyan"} dot pulse /> : null} />
        {next ? (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 10 }}>
              {[["Service", by(SERVICES, next.service)!.name], ["When", `${fmtDate(next.date)}, ${by(WINDOWS, next.win)!.start}`], ["Reference", next.ref], ["Due after visit", money(next.total)]].map(([k, v]) => (
                <View key={k} style={{ width: "50%", paddingRight: 8 }}><Label>{k}</Label><Text style={T.body}>{v}</Text></View>
              ))}
            </View>
            <Btn label="View visit details" kind="sec" onPress={() => openReport(next.id)} />
          </>
        ) : (
          <>
            <Text style={T.body2}>No visit booked. Regular maintenance keeps water stable and costs less per visit.</Text>
            <Btn label="Book a service" icon="cal" onPress={() => go("book")} />
          </>
        )}
      </Panel>

      <Panel index={3}>
        <SecHeader title="Current livestock" right={<Badge text={`${stock.reduce((s, x) => s + x.qty, 0)} total`} tone="tert" />} />
        <Text style={[T.small, { marginTop: -6 }]}>Sample list. Your technician updates it after each visit.</Text>
        <Chips items={[{ id: "all", label: "All" }, { id: "fish", label: `Fish (${fishN})` }, { id: "inv", label: `Invertebrates (${stock.length - fishN})` }]} value={filter} onChange={(v) => setFilter(v as any)} />
        <View>
          {shown.map((s, i) => (
            <Animated.View key={tank.type + s.name} entering={FadeIn.delay(i * 40)} exiting={FadeOut.duration(120)} layout={layout}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.hair }}>
              <View style={{ width: 52, height: 52, borderRadius: 6, backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}>
                <CritterArt kind={s.kind} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={T.h3}>{s.name}</Text>
                <Text style={T.small}>{s.role}</Text>
              </View>
              <Badge text={`Qty ${s.qty}`} tone="tert" />
            </Animated.View>
          ))}
        </View>
        <Btn label="See fish that suit this tank" kind="ghost" icon="fish" onPress={() => go("livestock")} />
      </Panel>
    </Screen>
  );
}
