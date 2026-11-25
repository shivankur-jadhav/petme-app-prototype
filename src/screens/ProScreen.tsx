import React, { useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { C, F, R, T } from "../theme";
import { Badge, Btn, Chips, Empty, Field, Label, Panel, Screen, Title, enter, haptic, layout } from "../components/ui";
import { TabId } from "../components/visuals";
import { byNewest, useStore } from "../store";
import { Booking, TankMedia, LABOUR, RECUR, SERVICES, SUPPLY, WINDOWS, by, chemOf, cancelPatch, econ, BASE, TRAVEL_COST_PER_KM, fmtDate, grandTotal, restorePatch, metricsFor, money, money0, revenue } from "../data";
import { StatusBadge, tankLine } from "./HistoryScreen";
import { Icon } from "../components/Icon";
import { forgetMedia, pickTankMedia } from "../media";

function CompleteForm({ b, onDone, onCancel, toast }: { b: Booking; onDone: (r: Record<string, number>, notes: string, media?: TankMedia) => void; onCancel: () => void; toast: (t: string) => void }) {
  const ms = metricsFor(b.type);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [media, setMedia] = useState<TankMedia | undefined>();
  const [busy, setBusy] = useState(false);
  const attach = async (source: "camera" | "library") => {
    setBusy(true);
    try {
      const r = await pickTankMedia(source, "technician", b.ref);
      if ("denied" in r) toast("Allow camera access in Settings to film the tank.");
      else if ("media" in r) { forgetMedia(media); setMedia(r.media); haptic.success(); }
    } catch {
      toast("Couldn't open that. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOut.duration(150)} layout={layout} style={{ gap: 10, borderTopWidth: 1, borderTopColor: C.hair, paddingTop: 12 }}>
      <Label color={C.primary}>Log water test and complete</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ms.map((m) => (
          <Field key={m.id} style={{ flexBasis: "30%", minWidth: 96 }} label={m.label + (m.unit ? ` (${m.unit})` : "")} value={vals[m.id] || ""}
            onChangeText={(v) => setVals({ ...vals, [m.id]: v.replace(",", ".") })} keyboardType="decimal-pad" placeholder={String(m[chemOf(b.type)]![0])} />
        ))}
      </View>
      <Field label="Notes for the customer" value={notes} onChangeText={setNotes} multiline placeholder="What you did, what you noticed, advice for the customer" />
      <View style={{ gap: 8 }}>
        <Label>Tank video for the customer</Label>
        {media ? (
          <Animated.View entering={FadeIn} style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Icon name="check" size={16} color={C.ok} width={2.4} />
            <Text style={[T.body2, { flex: 1 }]}>{media.kind === "video" ? "Video" : "Photo"} attached. It will show at the top of the customer's Tanks screen.</Text>
            <Btn small kind="plain" label="Remove" onPress={() => { forgetMedia(media); setMedia(undefined); }} />
          </Animated.View>
        ) : (
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn small kind="sec" icon="camera" label="Record tank" disabled={busy} onPress={() => attach("camera")} />
            <Btn small kind="plain" icon="gallery" label="Choose" disabled={busy} onPress={() => attach("library")} />
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Btn small label="Save report and complete" icon="check" onPress={() => {
          const r: Record<string, number> = {};
          Object.keys(vals).forEach((k) => { const n = Number(vals[k]); if (vals[k] !== "" && !isNaN(n)) r[k] = n; });
          onDone(r, notes.trim(), media);
        }} />
        <Btn small kind="plain" label="Cancel" onPress={() => { forgetMedia(media); onCancel(); }} />
      </View>
    </Animated.View>
  );
}

export default function ProScreen({ openReport, go }: { openReport: (id: string) => void; go: (t: TabId) => void }) {
  const { bookings, patchBooking, removeBooking, loadExamples, clearExamples, toast } = useStore();
  const [filter, setFilter] = useState("all");
  const [completing, setCompleting] = useState<string | null>(null);
  const rows = [...bookings].sort(byNewest);
  const live = rows.filter((r) => r.status !== "cancelled");
  const open = rows.filter((r) => r.status === "new" || r.status === "confirmed").length;
  // Booked value: live jobs in full, plus booking charges kept on late customer cancellations.
  const value = live.reduce((s, r) => s + grandTotal(r), 0) + rows.reduce((s, r) => s + (r.status === "cancelled" && !r.bookRefunded ? r.bookTotal || 0 : 0), 0);
  const seen: Record<string, 1> = {};
  let mrr = 0;
  live.forEach((r) => { const k = r.name + r.tankName; if (r.monthly && !seen[k]) { seen[k] = 1; mrr += r.monthly; } });
  let sub = 0, mar = 0;
  live.forEach((r) => { const e = econ(r); if (e) { sub += revenue(r); mar += e.margin; } });
  const shown = rows.filter((r) => filter === "all" || r.status === filter);
  const hasEx = rows.some((r) => r.example);

  return (
    <Screen>
      <Title eyebrow="Technician console" title="Jobs" sub="Confirm requests, then complete each visit with a water test. The customer sees the report in their history." />
      {!rows.length ? (
        <Empty title="No jobs yet" text="Requests from the booking screen appear here. To see how it works first, add a few example jobs. They are labelled as examples and you can remove them in one tap.">
          <Btn label="Add 4 example jobs" onPress={() => { loadExamples(); haptic.success(); toast("Added 4 example jobs."); }} />
          <Btn label="Make a real request" kind="sec" onPress={() => go("book")} />
        </Empty>
      ) : (
        <>
          <Animated.View entering={enter(1)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[[String(open), "Open jobs"], [money0(value), "Booked, tax in"], [money0(mrr), "Recurring per month"], [sub ? Math.round((mar / sub) * 100) + "%" : "n/a", "Est. margin"]].map(([v, l]) => (
              <View key={l} style={{ flexBasis: "47%", flexGrow: 1, backgroundColor: C.s, borderWidth: 1, borderColor: C.hair, borderRadius: R.lg, padding: 12 }}>
                <Animated.Text key={v} entering={FadeIn.duration(300)} style={{ fontFamily: F.head700, fontSize: 22, color: C.primaryHi }}>{v}</Animated.Text>
                <Text style={T.small}>{l}</Text>
              </View>
            ))}
          </Animated.View>
          <Chips items={[{ id: "all", label: "All" }, { id: "new", label: "Requested" }, { id: "confirmed", label: "Confirmed" }, { id: "done", label: "Completed" }, { id: "cancelled", label: "Cancelled" }]} value={filter} onChange={setFilter} />
          {shown.length ? shown.map((b, i) => {
            const e = econ(b);
            return (
              <Panel key={b.id} index={i + 2}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Text style={[T.h3, { marginRight: "auto" }]}>{by(SERVICES, b.service)?.name}</Text>
                  {b.example ? <Badge text="Example" tone="slate" dashed /> : null}
                  <StatusBadge s={b.status} />
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 8 }}>
                  {[["When", `${fmtDate(b.date)}, ${by(WINDOWS, b.win)?.start}`], ["Customer", b.name], ["Phone", b.phone], ["Location", `${b.address ? b.address + ", " : ""}${b.city}${b.km != null ? ` (${b.km} km from base)` : ""}`], ["Tank", tankLine(b)], ["Plan", b.recur !== "once" ? by(RECUR, b.recur)!.name : "One visit"]].map(([k, v]) => (
                    <View key={k} style={{ width: "50%", paddingRight: 8 }}><Label>{k}</Label><Text style={T.body}>{v}</Text></View>
                  ))}
                </View>
                {b.notes ? <Text style={[T.body2, { backgroundColor: C.bg, padding: 10, borderRadius: R.sm }]}>{b.notes}</Text> : null}
                {b.wishlist?.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}><Label>Wants to discuss</Label>{b.wishlist.map((n) => <Badge key={n} text={n} tone="tert" />)}</View> : null}
                {completing === b.id ? (
                  <CompleteForm b={b} toast={toast} onCancel={() => setCompleting(null)} onDone={(results, techNotes, media) => {
                    patchBooking(b.id, { status: "done", results, techNotes, media, completedAt: Date.now() });
                    setCompleting(null); haptic.success(); toast("Report sent to the customer.");
                  }} />
                ) : (
                  <Animated.View layout={layout} style={{ gap: 10 }}>
                    <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>
                      {b.bookTotal ? <>Booking <Text style={{ color: C.ink }}>{money(b.bookTotal)}</Text> {b.status === "cancelled" ? (b.bookRefunded ? "refunded" : "kept") : "paid"} · </> : null}{b.status === "done" ? "Service" : "Due after"} <Text style={{ color: C.ink }}>{money(b.total)}</Text>{e ? <> · Margin <Text style={{ color: C.ink }}>{money0(e.margin)} ({Math.round(e.pct * 100)}%)</Text></> : null}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {b.status === "new" ? <><Btn small label="Confirm" onPress={() => { patchBooking(b.id, { status: "confirmed" }); haptic.success(); }} /><Btn small kind="danger" label="Decline" onPress={() => patchBooking(b.id, cancelPatch(b, "petme"))} /></> : null}
                      {b.status === "confirmed" ? <><Btn small label="Complete with report" onPress={() => setCompleting(b.id)} /><Btn small kind="danger" label="Cancel" onPress={() => patchBooking(b.id, cancelPatch(b, "petme"))} /></> : null}
                      {b.status === "cancelled" ? <Btn small kind="sec" label="Restore" onPress={() => patchBooking(b.id, restorePatch)} /> : null}
                      {b.status === "done" ? <Btn small kind="sec" label="View report" onPress={() => openReport(b.id)} /> : null}
                      <Btn small kind="plain" label="Remove" onPress={() => removeBooking(b.id)} />
                    </View>
                  </Animated.View>
                )}
              </Panel>
            );
          }) : <Empty title="Nothing here" text="No jobs with that status." />}
          <Btn kind="sec" small label={hasEx ? "Remove example jobs" : "Add example jobs"} onPress={() => { if (hasEx) { clearExamples(); toast("Removed example jobs."); } else { loadExamples(); toast("Added 4 example jobs."); } }} />
          <Text style={T.small}>Margin assumes labour at ${LABOUR} per hour, driving at ${TRAVEL_COST_PER_KM.toFixed(2)} per km both ways from {BASE.name} and supplies at {Math.round(SUPPLY * 100)}% of the pre-tax service price. Revenue includes the booking charge. Swap in your real costs after the first jobs.</Text>
        </>
      )}
    </Screen>
  );
}
