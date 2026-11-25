import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, SlideInRight, SlideOutRight, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, T, themed } from "../theme";
import { Icon } from "../components/Icon";
import { Badge, Btn, Empty, Label, Ledger, Panel, Press, Screen, SecHeader, Title, enter, haptic, layout } from "../components/ui";
import { MetricGrid, TabId } from "../components/visuals";
import { TankPill, TankView, mediaCaption } from "../components/TankView";
import { byNewest, useStore } from "../store";
import { Booking, RECUR, SERVICES, SIZES, TYPES, WINDOWS, by, fmtDate, cancelPatch, fmtDur, grandTotal, metricsFor, money, refundable, tasksFor } from "../data";

export const STATUS: Record<string, [string, string]> = { new: ["Requested", "tert"], confirmed: ["Confirmed", "cyan"], done: ["Completed", "ok"], cancelled: ["Cancelled", "slate"] };
export const StatusBadge = ({ s }: { s: string }) => <Badge text={STATUS[s]?.[0] || s} tone={STATUS[s]?.[1] || "slate"} dot pulse={s === "new" || s === "confirmed"} />;
export const tankLine = (b: Booking) => `${by(SIZES, b.size)?.name || ""} gal · ${by(TYPES, b.type)?.name || ""}`;

export default function HistoryScreen({ openReport, go }: { openReport: (id: string) => void; go: (t: TabId) => void }) {
  const { bookings } = useStore();
  const rows = [...bookings].sort(byNewest);
  return (
    <Screen>
      <Title eyebrow="Service history" title="Your visits" />
      {rows.length ? rows.map((b, i) => (
        <Animated.View key={b.id} entering={enter(i + 1)} layout={layout}>
          <Press onPress={() => openReport(b.id)} scaleTo={0.98} style={s.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text style={[T.h3, { marginRight: "auto" }]}>{by(SERVICES, b.service)?.name}</Text>
              {b.example ? <Badge text="Example" tone="slate" dashed /> : null}
              <StatusBadge s={b.status} />
            </View>
            <View style={s.kv}>
              {[["Date", fmtDate(b.date)], ["Reference", b.ref], ["Tank", tankLine(b)], b.status === "done" ? ["Total paid", money(grandTotal(b))] : ["Due after visit", money(b.total)]].map(([k, v]) => (
                <View key={k} style={s.kvCell}><Label>{k}</Label><Text style={[T.body, k === "Reference" && { fontFamily: F.mono }]}>{v}</Text></View>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end" }}>
              <Text style={[T.small, { color: C.primary }]}>{b.status === "done" ? "View report" : "View details"}</Text>
              <Icon name="chev" size={14} color={C.primary} />
            </View>
          </Press>
        </Animated.View>
      )) : (
        <Empty title="No visits yet" text="Booked visits and their service reports appear here, with the water test results your technician logs.">
          <Btn label="Book your first visit" icon="cal" onPress={() => go("book")} />
        </Empty>
      )}
    </Screen>
  );
}

/** Full-screen service report that slides in over the current tab. */
export function ReportScreen({ id, onClose, go }: { id: string; onClose: () => void; go: (t: TabId) => void }) {
  const { bookings, patchBooking, toast } = useStore();
  const ins = useSafeAreaInsets();
  const b = bookings.find((x) => x.id === id);
  if (!b) return null;
  const svc = by(SERVICES, b.service)!;
  const done = b.status === "done";
  const tasks = tasksFor(b);
  // Older bookings were charged HST on the booking charge; show it only for those.
  const bookHst: [string, string][] = b.bookTax ? [["HST 13%", money(b.bookTax)]] : [];
  return (
    <Animated.View entering={SlideInRight.springify().damping(22).stiffness(200)} exiting={SlideOutRight.duration(220)} style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={{ paddingTop: ins.top + 10, paddingHorizontal: 16, paddingBottom: ins.bottom + 112, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Press onPress={onClose} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 }} accessibilityLabel="Back">
            <Icon name="back" size={18} color={C.primary} /><Text style={{ color: C.primary, fontFamily: F.body500, fontSize: 15 }}>Back</Text>
          </Press>
          <StatusBadge s={b.status} />
        </View>
        <Animated.View entering={enter(0)} style={{ gap: 4 }}>
          <Label color={C.primary}>{`Visit ${b.ref}${b.example ? " · example" : ""}`}</Label>
          <Text style={T.h1}>{svc.name}</Text>
          <Text style={T.small}>{(b.tankName ? b.tankName + " · " : "") + tankLine(b)}</Text>
        </Animated.View>

        <Panel index={1}>
          <View style={s.tiles}>
            {[["Date", fmtDate(b.date, false), by(WINDOWS, b.win)?.sub || ""], ["Duration", fmtDur(svc.hours[b.size]), done ? "On site" : "Estimated"], ["Tasks", `${done ? tasks.length : 0}/${tasks.length}`, done ? "Completed" : "Planned"]].map(([k, v, sub], i) => (
              <View key={k} style={[s.tile, i < 2 && { borderRightWidth: 1, borderRightColor: C.hair }]}>
                <Label>{k}</Label>
                <Text style={{ fontFamily: F.head600, fontSize: 17, color: C.ink }}>{v}</Text>
                <Text style={[T.small, { fontSize: 11 }]}>{sub}</Text>
              </View>
            ))}
          </View>
          <View style={s.kv}>
            <View style={s.kvCell}><Label>Location</Label><Text style={T.body}>{b.city}</Text></View>
            <View style={s.kvCell}><Label>Contact</Label><Text style={T.body}>{b.name}, {b.phone}</Text></View>
          </View>
        </Panel>

        <Panel index={2}>
          <SecHeader title="Work checklist" icon="pro" right={<Badge text={done ? "Tasks completed" : "Planned tasks"} tone={done ? "ok" : "slate"} />} />
          {tasks.map((t, i) => (
            <View key={t} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.hair, alignItems: "center" }}>
              <View style={[s.tick, done && { backgroundColor: C.tertiary, borderColor: C.tertiary }]}>
                {done ? <Animated.View entering={ZoomIn.delay(300 + i * 90).springify().damping(12)}><Icon name="check" size={13} color={C.onPrimary} width={3} /></Animated.View> : null}
              </View>
              <Text style={[T.h3, { fontSize: 14, flex: 1, color: done ? C.ink : C.ink2 }]}>{t}</Text>
            </View>
          ))}
        </Panel>

        {done && b.results && Object.keys(b.results).length ? (
          <Panel index={3}>
            <SecHeader title="Post-service chemistry" icon="flask" />
            <MetricGrid readings={b.results} type={b.type} metrics={metricsFor(b.type)} />
          </Panel>
        ) : null}

        {b.media ? (
          <Panel index={4} style={{ padding: 0, overflow: "hidden", gap: 0 }}>
            <TankView type={b.type} media={b.media} height={190} footer={<TankPill icon={b.media.kind === "video" ? "video" : "gallery"} text={mediaCaption(b.media)} />} />
          </Panel>
        ) : null}

        {b.techNotes ? (
          <Panel index={4}>
            <Text style={T.h2}>Technician notes</Text>
            <View style={{ borderLeftWidth: 2, borderLeftColor: C.primary, paddingLeft: 12 }}><Text style={T.body}>{b.techNotes}</Text></View>
          </Panel>
        ) : null}

        {b.notes || b.wishlist?.length ? (
          <Panel index={5} flat>
            <Label>Your notes</Label>
            {b.notes ? <Text style={[T.body2, { backgroundColor: C.bg, padding: 10, borderRadius: R.sm }]}>{b.notes}</Text> : null}
            {b.wishlist?.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{b.wishlist.map((n) => <Badge key={n} text={n} tone="tert" />)}</View> : null}
          </Panel>
        ) : null}

        <Panel index={6} flat>
          <Label>Billing</Label>
          {b.bookTotal ? (
            <>
              {b.status === "cancelled" ? (
                <Ledger
                  rows={[["Booking charge", money(b.bookFee || 0)], ...bookHst, ...(b.bookRefunded ? [["Refunded", money(-b.bookTotal), true] as [string, string, boolean]] : [])]}
                  totalLabel={b.bookRefunded ? "Booking charge refunded" : "Booking charge kept"}
                  totalSub={b.bookRefunded ? "Visit cancelled more than 24 hours ahead" : "Visit cancelled less than 24 hours ahead"}
                  total={money(b.bookRefunded ? 0 : b.bookTotal)}
                />
              ) : (
                <Ledger
                  rows={[["Booking charge", money(b.bookFee || 0)], ...bookHst]}
                  totalLabel="Paid at booking"
                  totalSub="Refunded if you cancel more than 24 hours before the visit"
                  total={money(b.bookTotal)}
                />
              )}
              <View style={{ height: 6 }} />
            </>
          ) : null}
          <Ledger
            rows={[["Service", money(b.base + (b.travel || 0))], ...(b.discAmt ? [["Plan discount", money(-b.discAmt), true] as [string, string, boolean]] : []), ["HST 13%", money(b.tax)]]}
            totalLabel={done ? "Paid after visit" : b.status === "cancelled" ? "Service charge" : "Due after visit"}
            totalSub={b.status === "cancelled" ? "Not charged, visit cancelled" : [b.recur !== "once" ? `${by(RECUR, b.recur)?.name} plan` : "One visit", done && b.bookTotal ? `${money(grandTotal(b))} in total` : ""].filter(Boolean).join(" · ")}
            total={money(b.status === "cancelled" ? 0 : b.total)}
          />
        </Panel>

        {b.status === "new" || b.status === "confirmed" ? (
          <Animated.View entering={FadeIn.delay(400)} style={{ gap: 8 }}>
            {b.bookTotal ? (
              <Text style={[T.small, { textAlign: "center" }]}>
                {refundable(b) ? `Cancel now and your ${money(b.bookTotal)} booking charge is refunded.` : `The visit is less than 24 hours away, so the ${money(b.bookTotal)} booking charge is not refunded.`}
              </Text>
            ) : null}
            <Btn label="Cancel this visit" kind="danger" onPress={() => {
              const p = cancelPatch(b, "customer");
              patchBooking(b.id, p); haptic.soft();
              toast(!b.bookTotal ? "Visit cancelled." : p.bookRefunded ? "Visit cancelled. Booking charge refunded." : "Visit cancelled. Booking charge kept.");
            }} />
          </Animated.View>
        ) : null}
        {done ? <Btn label="Book the next visit" icon="cal" onPress={() => { onClose(); go("book"); }} /> : null}
      </ScrollView>
    </Animated.View>
  );
}

const s = themed(() => StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, backgroundColor: C.glass },
  kv: { flexDirection: "row", flexWrap: "wrap", rowGap: 10 },
  kvCell: { width: "50%", paddingRight: 8, gap: 2 },
  tiles: { flexDirection: "row", borderWidth: 1, borderColor: C.hair, borderRadius: R.md, overflow: "hidden" },
  tile: { flex: 1, padding: 10, gap: 3 },
  tick: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: C.line2, alignItems: "center", justifyContent: "center" },
}));
