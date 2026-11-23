import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { C, R, T } from "../theme";
import { CritterArt } from "../components/Icon";
import { Badge, Btn, Panel, Screen, Title, enter, layout } from "../components/ui";
import { TabId } from "../components/visuals";
import { useStore } from "../store";
import { IDEAS, SIZES, TYPES, by, chemOf } from "../data";

export default function LivestockScreen({ go }: { go: (t: TabId) => void }) {
  const { tank, wish, toggleWish, toast } = useStore();
  const ideas = IDEAS[chemOf(tank.type)];
  const gal = by(SIZES, tank.size)!.gal;
  return (
    <Screen>
      <Title eyebrow="Livestock" title="Fish that suit your tank"
        sub={`Ideas for a ${by(SIZES, tank.size)!.name} gal ${by(TYPES, tank.type)!.name.toLowerCase()} tank. Add any to your next visit and your technician will check fit and help you source them.`} />
      {ideas.map((f, i) => {
        const tooSmall = f.minGal > gal;
        const on = wish.includes(f.id);
        const fit = tooSmall ? ["crit", "Tank too small"] : f.fit === "good" ? ["ok", "Good fit"] : ["warn", "Use caution"];
        return (
          <Panel key={tank.type + f.id} index={i + 1}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 84, height: 84, borderRadius: R.md, backgroundColor: C.sHigh, alignItems: "center", justifyContent: "center" }}>
                <CritterArt kind="fish" color={f.color} width={60} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[T.label, { letterSpacing: 0.8 }]}>{f.sci}</Text>
                <Text style={[T.h2, { fontSize: 18 }]}>{f.name}</Text>
                <Badge text={fit[1]} tone={fit[0]} dot pulse={fit[0] !== "ok"} />
              </View>
            </View>
            <Text style={T.body2}>{f.note}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {f.tags.map((t) => <Badge key={t} text={t} tone="slate" />)}
              <Badge text={`Min. ${f.minGal} gal`} tone="slate" />
            </View>
            <Animated.View key={String(on)} entering={FadeIn.duration(180)}>
              <Btn
                label={on ? "Added to next visit" : "Discuss at next visit"}
                icon={on ? "check" : "plus"}
                kind={on ? "sec" : "ghost"}
                disabled={tooSmall}
                onPress={() => { const now = toggleWish(f.id); toast(now ? `${f.name} added to your next visit.` : "Removed from your next visit."); }}
              />
            </Animated.View>
          </Panel>
        );
      })}
      <Animated.Text entering={enter(6)} style={T.small}>Minimum tank sizes are common hobby guidance, not a guarantee. Your technician confirms fit with your current fish before anything is added.</Animated.Text>
      {wish.length ? (
        <Animated.View entering={FadeInDown.springify()} exiting={FadeOut} layout={layout}>
          <Btn label={`Book a visit with ${wish.length} to discuss`} icon="cal" onPress={() => go("book")} />
        </Animated.View>
      ) : null}
    </Screen>
  );
}
