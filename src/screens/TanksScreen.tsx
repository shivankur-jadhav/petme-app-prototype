import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { C, T } from "../theme";
import { Icon } from "../components/Icon";
import { PhotoCredits, SpeciesThumb } from "../components/SpeciesThumb";
import { Badge, Btn, Chips, Field, Label, Panel, Press, Screen, SecHeader, Segmented, enter, haptic, layout, st } from "../components/ui";
import { TankPill, TankView, mediaCaption } from "../components/TankView";
import { forgetMedia, latestTankMedia, pickTankMedia } from "../media";
import { MetricGrid, TabId } from "../components/visuals";
import { useStore } from "../store";
import { RECUR, SAMPLE_READINGS, SERVICES, SIZES, STOCK, TYPES, WINDOWS, by, chemOf, fmtDate, iso, metricsFor, money, todayIso, SizeId, TankType } from "../data";

export default function TanksScreen({ go, openReport }: { go: (t: TabId) => void; openReport: (id: string) => void }) {
  const { tank, setTank, bookings, toast } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tank);
  const [filter, setFilter] = useState<"all" | "fish" | "inv">("all");
  const [videoPanel, setVideoPanel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photoFor, setPhotoFor] = useState<string | null>(null);

  // Photos of the customer's own fish replace the stock species photo in Current livestock.
  const fishPhotos = tank.fishPhotos || {};
  const addFishPhoto = async (name: string, source: "camera" | "library") => {
    setBusy(true);
    try {
      const r = await pickTankMedia(source, "customer", undefined, true);
      if ("denied" in r) { toast("Allow camera access in your phone's Settings to photograph your fish."); return; }
      if ("canceled" in r) return;
      forgetMedia(fishPhotos[name]);
      setTank({ ...tank, fishPhotos: { ...fishPhotos, [name]: r.media } });
      setPhotoFor(null);
      haptic.success();
      toast("Photo added.");
    } catch {
      toast("Couldn't open that. Try again.");
    } finally {
      setBusy(false);
    }
  };
  const removeFishPhoto = (name: string) => {
    forgetMedia(fishPhotos[name]);
    const next = { ...fishPhotos };
    delete next[name];
    setTank({ ...tank, fishPhotos: next });
    setPhotoFor(null);
    toast("Photo removed.");
  };

  // The tank shown at the top: the newest of the customer's own video and any video a technician
  // attached when finishing a visit. Without either, the animated illustration stands in.
  const media = useMemo(() => latestTankMedia(tank.media, bookings.filter((b) => b.status === "done").map((b) => b.media)), [tank.media, bookings]);

  const addMedia = async (source: "camera" | "library") => {
    setBusy(true);
    try {
      const r = await pickTankMedia(source, "customer");
      if ("denied" in r) { toast("Allow camera access in your phone's Settings to film your tank."); return; }
      if ("canceled" in r) return;
      forgetMedia(tank.media);
      setTank({ ...tank, media: r.media, sample: false });
      setVideoPanel(false);
      haptic.success();
      toast(r.media.kind === "video" ? "Tank video added." : "Tank photo added.");
    } catch {
      toast("Couldn't open that. Try again.");
    } finally {
      setBusy(false);
    }
  };

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
        <TankView
          type={tank.type}
          onAdd={addMedia}
          busy={busy}
          media={media}
          tags={<><Badge text="My tank" />{tank.sample ? <Badge text="Sample profile" tone="slate" dashed /> : null}</>}
          footer={media ? <TankPill icon={media.kind === "video" ? "video" : "gallery"} text={mediaCaption(media)} /> : null}
        />
        <View style={{ padding: 16, gap: 4 }}>
          <Text style={[T.h1, { fontSize: 24 }]}>{tank.name}</Text>
          <Text style={T.small}>{type.name} · {size.name} gal</Text>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
            <Text style={T.small}>Plan <Text style={{ color: C.tertiary }}>{next && next.recur !== "once" ? by(RECUR, next.recur)!.name : "None yet"}</Text></Text>
            <Text style={T.small}>Last service <Text style={{ color: C.tertiary }}>{report ? fmtDate(report.date, false) : "None"}</Text></Text>
            <Press onPress={() => { setVideoPanel(!videoPanel); setEditing(false); }} style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name={videoPanel ? "close" : "video"} size={15} color={C.muted} />
              <Text style={[T.small, { color: C.ink2 }]}>{videoPanel ? "Close" : "Tank video"}</Text>
            </Press>
            <Press onPress={() => { setDraft(tank); setEditing(!editing); setVideoPanel(false); }} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon name={editing ? "close" : "edit"} size={15} color={C.muted} />
              <Text style={[T.small, { color: C.ink2 }]}>{editing ? "Close" : "Edit tank"}</Text>
            </Press>
          </View>
        </View>
      </Animated.View>

      {videoPanel ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)} layout={layout} style={st.panel}>
          <SecHeader title={tank.media ? "Change your tank video" : "Add your tank video"} icon="video" />
          <Text style={T.body2}>Film 10 to 30 seconds of your tank from the front with the tank light on. Hold your phone sideways and keep it still. It plays on a silent loop at the top of this screen. A photo works too.</Text>
          <Btn label="Record a video" icon="camera" disabled={busy} onPress={() => addMedia("camera")} />
          <Btn label="Choose from my phone" icon="gallery" kind="sec" disabled={busy} onPress={() => addMedia("library")} />
          {tank.media ? (
            <Btn label="Remove my video" icon="trash" kind="danger" disabled={busy} onPress={() => { forgetMedia(tank.media); setTank({ ...tank, media: undefined }); setVideoPanel(false); toast("Video removed."); }} />
          ) : null}
          {media && media.by === "technician" ? (
            <Text style={T.small}>Showing the video your technician recorded on {fmtDate(iso(new Date(media.addedAt)))}. A video you add now shows instead.</Text>
          ) : null}
        </Animated.View>
      ) : null}

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
              style={{ paddingVertical: 12, gap: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.hair }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <SpeciesThumb species={s} own={fishPhotos[s.name]?.uri} size={60} zoom={{ extra: [{ label: `In your tank: ${s.qty}` }] }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={T.h3}>{s.name}</Text>
                  <Text style={T.small}>{s.role}</Text>
                  {fishPhotos[s.name] ? <Text style={[T.small, { color: C.primary, fontSize: 11 }]}>Your photo</Text> : null}
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Badge text={`Qty ${s.qty}`} tone="tert" />
                  <Press onPress={() => setPhotoFor(photoFor === s.name ? null : s.name)} accessibilityLabel={`Photograph your ${s.name}`}
                    style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: photoFor === s.name ? C.primaryTint : C.sHigh }}>
                    <Icon name={photoFor === s.name ? "close" : "camera"} size={16} color={photoFor === s.name ? C.primary : C.muted} />
                  </Press>
                </View>
              </View>
              {photoFor === s.name ? (
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ gap: 8 }}>
                  <Text style={T.small}>Show your own {s.name.toLowerCase()} here instead of the stock photo.</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    <Btn small icon="camera" label="Take photo" disabled={busy} onPress={() => addFishPhoto(s.name, "camera")} />
                    <Btn small kind="sec" icon="gallery" label="Choose photo" disabled={busy} onPress={() => addFishPhoto(s.name, "library")} />
                    {fishPhotos[s.name] ? <Btn small kind="plain" icon="trash" label="Use stock photo" onPress={() => removeFishPhoto(s.name)} /> : null}
                  </View>
                </Animated.View>
              ) : null}
            </Animated.View>
          ))}
        </View>
        <PhotoCredits species={stock.filter((c) => !fishPhotos[c.name])} />
        <Btn label="See fish that suit this tank" kind="ghost" icon="fish" onPress={() => go("livestock")} />
      </Panel>
    </Screen>
  );
}
