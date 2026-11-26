// The customer's tank, illustrated, for when no video or photo has been added yet: scenery that
// matches the tank type (reef, freshwater or planted) with plants and corals swaying in the water,
// and the customer's own livestock drawn with the species art, swimming and resting where each
// species lives. The water itself (surface ripple, light, bubbles, specks) is TankView's WaterLife.
// Underwater art, so it stays the same in light and dark themes (colours are artwork, not UI tokens).
// Motion budget: at most 4 swimming fish (each on one looping value that also drives its turn,
// tail beat and tilt), a handful of swaying plant clumps, and one shared clock for every resting
// animal's idle motion (gobies hop, plecos breathe, shrimp rock).
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgGrad, Path, Rect, Stop } from "react-native-svg";
import { CritterArt } from "./Icon";
import { Critter, SizeId, STOCK, TankType, chemOf } from "../data";

type Transform = NonNullable<ViewStyle["transform"]>;

// Scenery is designed on a 400 x 210 canvas, anchored to the bottom of the tank.
const VW = 400, VH = 210;
// Bigger tanks hold more water, so the same fish look smaller in them.
const SIZE_K: Record<SizeId, number> = { s: 1.15, m: 1, l: 0.86, xl: 0.74 };

type Swim = { mode: "swim"; x0: number; x1: number; y: number; size: number; dur: number; delay?: number; bob?: number; meander?: number };
type Rest = { mode: "rest"; x: number; y: number; size: number; flip?: boolean; rot?: number };
type Place = Swim | Rest;

/** Where each species lives in the tank, in canvas units. One entry per animal shown. */
const PLACES: Record<string, Place[]> = {
  // Reef
  clown: [
    { mode: "swim", x0: 246, x1: 352, y: 116, size: 44, dur: 3600 },
    { mode: "swim", x0: 256, x1: 346, y: 134, size: 38, dur: 4300, delay: 700, bob: 3 },
  ],
  cardinal: [{ mode: "swim", x0: 96, x1: 240, y: 82, size: 40, dur: 6600, delay: 400, bob: 2, meander: -12 }],
  goby: [{ mode: "rest", x: 238, y: 196, size: 42 }],
  cleaner: [{ mode: "rest", x: 70, y: 170, size: 40, flip: true }],
  turbo: [{ mode: "rest", x: 112, y: 142, size: 26 }],
  // Freshwater and planted
  neon: [
    { mode: "swim", x0: 14, x1: 386, y: 72, size: 28, dur: 8200, meander: 26 },
    { mode: "swim", x0: 26, x1: 394, y: 84, size: 27, dur: 8200, delay: 160, meander: 26 },
    { mode: "swim", x0: 6, x1: 378, y: 92, size: 26, dur: 8200, delay: 320, meander: 26 },
  ],
  panda: [{ mode: "swim", x0: 110, x1: 356, y: 180, size: 34, dur: 10400, delay: 900, bob: 1.5 }],
  pleco: [{ mode: "rest", x: 256, y: 200, size: 52, flip: true }],
  amano: [{ mode: "rest", x: 306, y: 197, size: 30 }],
  nerite: [{ mode: "rest", x: 360, y: 199, size: 24 }],
};
const MAX_SWIMMERS = 4;

/**
 * A swimming fish. One looping value drives everything, so there is no extra animation loop:
 * eased back-and-forth travel, a smooth turn at each end (the body narrows as it turns instead
 * of snapping round), a quick tail-beat wiggle, gentle bobbing and meandering, and the body tilting
 * nose-up when rising and nose-down when diving.
 */
function Swimmer({ art, x0, x1, y, size, dur, delay = 0, bob = 4, meander = 0, label, onPress }: { art: string; x0: number; x1: number; y: number; size: number; dur: number; delay?: number; bob?: number; meander?: number; label: string; onPress?: () => void }) {
  // Starts just past the turn so the fish is visible (not mid-turn) while waiting for its delay.
  const p = useSharedValue(0.06);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(2.06, { duration: dur * 2, easing: Easing.linear }), -1, false));
  }, [dur, delay]);
  const range = Math.max(0, x1 - x0 - size);
  const beats = dur / 170; // tail beats per half lap
  const a = useAnimatedStyle(() => {
    const u = p.value % 2;
    const t = u < 1 ? u : 2 - u;
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const facing = Math.max(-1, Math.min(1, Math.sin(Math.PI * u) * 4)); // +1 swimming right, -1 left, through 0 while turning
    const speed = Math.sin(Math.PI * t); // fastest mid-tank, slowest at the turns
    const dy = 3 * bob * Math.cos(Math.PI * 3 * u) + meander * Math.cos(Math.PI * u); // vertical velocity
    const tilt = Math.max(-14, Math.min(14, dy * 0.7)) * (facing >= 0 ? 1 : -1);
    const wag = Math.sin(u * Math.PI * beats) * (1.2 + 2.2 * speed);
    return {
      transform: [
        { translateX: x0 + eased * range },
        { translateY: Math.sin(u * Math.PI * 3) * bob + Math.sin(u * Math.PI) * meander },
        { rotate: `${tilt + wag}deg` },
        { scaleX: -facing }, // the art faces left
        { scaleY: 1 + 0.03 * Math.cos(u * Math.PI * beats) },
      ] as Transform,
    };
  });
  return (
    <Animated.View style={[{ position: "absolute", left: 0, top: y - (size * 32) / 48 / 2 }, a]}>
      <Pressable onPress={onPress} disabled={!onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel={label}>
        <CritterArt art={art} width={size} />
      </Pressable>
    </Animated.View>
  );
}

/** How each resting species idles: gobies hop a little, plecos breathe, shrimp rock, snails barely move. */
const IDLE: Record<string, { bob: number; breathe: number; rock: number }> = {
  goby: { bob: 1.6, breathe: 0.03, rock: 2 },
  pleco: { bob: 0.4, breathe: 0.035, rock: 0.6 },
  cleaner: { bob: 0.8, breathe: 0.02, rock: 4 },
  amano: { bob: 0.8, breathe: 0.02, rock: 3 },
  turbo: { bob: 0.3, breathe: 0.015, rock: 0.8 },
  nerite: { bob: 0.3, breathe: 0.015, rock: 0.8 },
};

/** A resting animal, idling on one clock shared by all resting animals (each at its own phase). */
function Rester({ art, x, y, size, flip, clock, phase, ground, label, onPress }: { art: string; x: number; y: number; size: number; flip?: boolean; clock: { value: number }; phase: number; ground: boolean; label: string; onPress?: () => void }) {
  const m = IDLE[art] || { bob: 0.5, breathe: 0.02, rock: 1 };
  const h = (size * 32) / 48;
  const a = useAnimatedStyle(() => {
    const c = clock.value + phase;
    return {
      transform: [
        { translateY: -Math.max(0, Math.sin(c)) * m.bob },
        { rotate: `${Math.sin(c * 0.7) * m.rock}deg` },
        { scaleX: flip ? -1 : 1 },
        { scaleY: 1 + Math.sin(c * 1.9) * m.breathe },
      ] as Transform,
    };
  });
  return (
    <>
      {ground ? <View pointerEvents="none" style={{ position: "absolute", left: x - size * 0.36, top: y - 2, width: size * 0.72, height: 4, borderRadius: size, backgroundColor: "rgba(4,14,26,0.16)" }} /> : null}
      <Animated.View pointerEvents="box-none" style={[{ position: "absolute", left: x - size / 2, top: y - h, transformOrigin: "50% 100%" } as any, a]}>
        <Pressable onPress={onPress} disabled={!onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}>
          <CritterArt art={art} width={size} />
        </Pressable>
      </Animated.View>
    </>
  );
}

/* ---------------- scenery ---------------- */

const WATER = {
  salt: ["#2378c4", "#114f8c", "#0a2f57"], // reef under blue LEDs
  fresh: ["#2f7f80", "#1b5458", "#0f3337"],
  planted: ["#3d8f6c", "#215c45", "#12382a"],
};

function Anemone({ x, y }: { x: number; y: number }) {
  const tips = [-34, -26, -18, -10, -3, 4, 11, 18, 26, 33];
  return (
    <G>
      <Ellipse cx={x} cy={y + 4} rx={20} ry={6} fill="#be185d" />
      {tips.map((dx, i) => {
        const h = 26 + ((i * 7) % 11);
        const ex = x + dx * 0.9, ey = y - h;
        return (
          <G key={i}>
            <Path d={`M${x + dx * 0.25} ${y + 2}Q${x + dx * 0.7} ${y - h * 0.5} ${ex} ${ey}`} stroke="#fb7185" strokeWidth={5} strokeLinecap="round" fill="none" />
            <Circle cx={ex} cy={ey} r={3} fill="#fecdd3" />
          </G>
        );
      })}
    </G>
  );
}

/** A scene is drawn as layers, back to front. A "sway" layer pivots gently around its base point. */
type Layer = { el: React.ReactNode; sway?: { x: number; y: number; deg: number; dur: number } };

function reefLayers(): Layer[] {
  return [
    { el: <G>
      <Path d="M0 210V150c20-8 34-6 50 2 14-14 40-16 56-4 10-8 28-8 38 4V210z" fill="#123760" opacity={0.75} />
      <Path d="M250 210v-52c18-14 44-14 60 0 16-10 40-10 56 4 12-4 24-2 34 6v42z" fill="#123760" opacity={0.75} />
    </G> },
    // sea fan behind the right rock
    { sway: { x: 372, y: 176, deg: 3, dur: 4200 }, el: <Path d="M372 176c-2-24-8-40-18-56M372 176c4-22 12-36 22-46M362 140c-8-6-14-8-22-8M368 152c8-10 14-14 22-14M356 124c4-8 4-14 2-20" stroke="#f97316" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} /> },
    { el: <G>
      {/* left live rock */}
      <Path d="M14 198c-4-26 8-46 30-52 6-14 26-22 42-14 14-10 36-6 44 8 18 2 30 18 28 36 4 8 4 16 2 22z" fill="#6d5a72" />
      <Path d="M18 198c4-14 18-22 36-20 16-8 36-6 50 2 16-4 34 0 48 12 6 2 8 4 8 6z" fill="#4f4057" />
      {[[40, 160, 3], [66, 150, 2.4], [96, 146, 3], [120, 162, 2.4], [52, 182, 2.6], [140, 180, 2.2], [84, 172, 2]].map(([cx, cy, r], i) => <Circle key={i} cx={cx} cy={cy} r={r} fill="#8a6f86" />)}
      {/* mushroom corals and zoanthids */}
      <Ellipse cx={116} cy={150} rx={9} ry={4} fill="#22c55e" /><Circle cx={116} cy={150} r={1.6} fill="#14532d" />
      <Ellipse cx={130} cy={158} rx={7} ry={3.4} fill="#f472b6" /><Circle cx={130} cy={158} r={1.4} fill="#831843" />
      {[[30, 150], [36, 154], [24, 156], [32, 160], [42, 160]].map(([cx, cy], i) => <G key={i}><Circle cx={cx} cy={cy} r={3} fill="#fb923c" /><Circle cx={cx} cy={cy} r={1.2} fill="#86efac" /></G>)}
      {/* right live rock, host to the anemone */}
      <Path d="M232 198c-2-22 10-38 28-42 8-12 28-16 40-6 16-4 32 6 36 22 10 6 14 16 12 26z" fill="#76607a" />
      <Path d="M236 198c8-12 22-16 38-14 14-6 32-4 46 4 12 0 22 4 28 10z" fill="#574660" />
      {[[256, 172, 2.6], [282, 160, 2.2], [318, 166, 2.8], [334, 184, 2.2], [270, 188, 2]].map(([cx, cy, r], i) => <Circle key={i} cx={cx} cy={cy} r={r} fill="#937a8f" />)}
    </G> },
    // branching acropora, stiff: barely moves
    { sway: { x: 80, y: 134, deg: 1.2, dur: 5200 }, el: <Path d="M80 134l-8-18M80 134l2-22M80 134l12-16M74 122l-8-6M82 116l6-8M90 122l8-4M70 120l-2-8" stroke="#c084fc" strokeWidth={3} strokeLinecap="round" /> },
    // the anemone the clownfish play in
    { sway: { x: 298, y: 156, deg: 5, dur: 2600 }, el: <Anemone x={298} y={152} /> },
    { el: <G>
      <Path d="M0 188c40-6 80 2 120-2s90-6 140 0 100 4 140-2V210H0z" fill="url(#reef-sand)" />
      <Path d="M20 198c14-3 26-3 40 0M90 202c16-3 30-3 46 0M210 200c14-3 28-3 42 0M300 204c16-3 30-3 44 0" stroke="#c9b68c" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <Circle cx={364} cy={196} r={12} fill="#a3e635" />
      <Path d="M356 190c4 3 8-3 12 0s6 4 8 2M354 196c5 3 9-3 14 0s6 3 9 1M357 202c4 2 8-2 12 0" stroke="#4d7c0f" strokeWidth={1.2} fill="none" />
      <Path d="M150 200c2-4 8-4 10 0z" fill="#fde68a" /><Path d="M228 204c2-3 6-3 8 0z" fill="#fecaca" />
      <Rect x={350} y={34} width={26} height={16} rx={5} fill="#0b1220" opacity={0.8} />
      <Circle cx={356} cy={42} r={4.2} fill="#1e293b" /><Circle cx={356} cy={42} r={1.4} fill="#475569" />
    </G> },
  ];
}

function Heater() {
  return (
    <G>
      <Rect x={370} y={30} width={10} height={112} rx={5} fill="rgba(226,232,240,0.14)" stroke="rgba(226,232,240,0.35)" strokeWidth={1} />
      <Path d="M375 52v80" stroke="#fb923c" strokeWidth={1.6} opacity={0.55} />
      <Circle cx={375} cy={46} r={3} fill="rgba(226,232,240,0.3)" /><Circle cx={375} cy={128} r={3} fill="rgba(226,232,240,0.3)" />
    </G>
  );
}

function Driftwood({ small }: { small?: boolean }) {
  const s = small ? 0.7 : 1;
  return (
    <G transform={`translate(${small ? 30 : 0} ${small ? 60 : 0}) scale(${s})`}>
      <Path d="M8 204c30-6 60-24 90-44 22-14 40-36 56-62 4-6 12-4 10 4-12 28-30 52-54 70-28 20-56 34-92 42z" fill="#5b4330" />
      <Path d="M100 160c14-6 30-8 46-4M126 120c10 2 18 6 24 12" stroke="#5b4330" strokeWidth={6} strokeLinecap="round" />
      <Path d="M30 196c24-8 48-22 70-40M120 140c12-12 22-26 30-40" stroke="#7c5c3f" strokeWidth={2} strokeLinecap="round" fill="none" />
    </G>
  );
}

function Sword({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  const leaves = [-38, -22, -8, 6, 20, 34];
  return (
    <G transform={`translate(${x} ${y}) scale(${k})`}>
      {leaves.map((a, i) => (
        <G key={i} transform={`rotate(${a})`}>
          <Path d="M0 0c-9-20-9-50 0-74 9 24 9 54 0 74z" fill={i % 2 ? "#22c55e" : "#16a34a"} />
          <Path d="M0 -4v-64" stroke="#15803d" strokeWidth={1} />
        </G>
      ))}
    </G>
  );
}

function Stem({ x, h, color, leaf }: { x: number; h: number; color: string; leaf: string }) {
  const n = Math.floor(h / 10);
  return (
    <G>
      <Path d={`M${x} 200c-2-${h / 3} 3-${(h * 2) / 3} 0-${h}`} stroke={color} strokeWidth={1.6} fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const yy = 196 - i * 10;
        return <G key={i}><Ellipse cx={x - 5} cy={yy} rx={5} ry={2} fill={leaf} /><Ellipse cx={x + 5} cy={yy - 4} rx={5} ry={2} fill={leaf} /></G>;
      })}
    </G>
  );
}

function freshLayers(planted: boolean): Layer[] {
  const stemsL = [18, 34, 50, 66], stemsR = [300, 316, 332, 348];
  const stem = (x: number, i: number) => <Stem key={x} x={x} h={110 + ((i * 17) % 40)} color={i % 3 === 0 ? "#b91c1c" : "#15803d"} leaf={i % 3 === 0 ? "#f87171" : "#4ade80"} />;
  return [
    planted
      ? { sway: { x: 42, y: 200, deg: 2.5, dur: 3800 }, el: <G>{stemsL.map((x, i) => stem(x, i))}</G> }
      : { sway: { x: 24, y: 200, deg: 3, dur: 3400 }, el: <Path d="M24 200c-4-50 6-90 0-150M34 200c6-40 14-70 10-130M14 200c-8-36-6-70-14-100" stroke="#4ade80" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} /> },
    planted
      ? { sway: { x: 324, y: 200, deg: -2.5, dur: 4300 }, el: <G>{stemsR.map((x, i) => stem(x, i + 4))}</G> }
      : { sway: { x: 336, y: 200, deg: -3, dur: 3900 }, el: <Path d="M330 200c4-40-6-80 2-130M342 200c8-30 18-60 14-100" stroke="#4ade80" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} /> },
    { el: <Driftwood small={planted} /> },
    // java fern tied to the wood
    { sway: { x: 132, y: 120, deg: 4, dur: 3000 }, el: <G transform="translate(132 120)">
      {[-50, -25, 0, 25, 50].map((a, i) => <Path key={i} transform={`rotate(${a})`} d="M0 0c-6-10-6-26 0-38 6 12 6 28 0 38z" fill={i % 2 ? "#166534" : "#15803d"} />)}
    </G> },
    ...(planted ? [{ el: <G>
      <Path d="M176 200c-4-20 8-34 24-36 10-8 26-6 32 6 10 4 14 16 12 30z" fill="#6b7280" />
      <Path d="M186 184c8-4 16-2 22 4M204 174c8 0 14 4 18 10M214 192c6-2 12 0 16 4" stroke="#4b5563" strokeWidth={1.4} fill="none" />
    </G> }] : []),
    { sway: { x: 316, y: 202, deg: 2.5, dur: 4600 }, el: <Sword x={316} y={202} k={planted ? 0.85 : 1} /> },
    { el: planted ? (
      <G>
        <Path d="M0 192c50-4 100 2 150-1s100-5 150 0 70 3 100 0V210H0z" fill="#2a2018" />
        <Path d={"M0 195" + "c3-3 7-3 10 0".repeat(40) + "v4H0z"} fill="#22c55e" opacity={0.85} />
        <Heater />
      </G>
    ) : (
      <G>
        <Path d="M0 190c50-4 100 2 150-1s100-5 150 0 70 3 100 0V210H0z" fill="#57493b" />
        {[[12, 198, "#8b7d6b"], [40, 204, "#a89b86"], [70, 196, "#6b5d4d"], [104, 202, "#8b7d6b"], [140, 198, "#a89b86"], [176, 204, "#6b5d4d"], [210, 196, "#8b7d6b"], [250, 202, "#a89b86"], [286, 198, "#6b5d4d"], [330, 204, "#8b7d6b"], [366, 198, "#a89b86"], [392, 204, "#6b5d4d"]].map(([cx, cy, f], i) => <Ellipse key={i} cx={cx as number} cy={cy as number} rx={3.2} ry={2.2} fill={f as string} />)}
        <Heater />
      </G>
    ) },
  ];
}

/** One scene layer: an SVG on the shared canvas, optionally swaying around its base. */
function SceneLayer({ layer, w, h, sc, offX, offY }: { layer: Layer; w: number; h: number; sc: number; offX: number; offY: number }) {
  const t = useSharedValue(0);
  const sw = layer.sway;
  useEffect(() => {
    if (!sw) return;
    t.value = withRepeat(withSequence(withTiming(1, { duration: sw.dur, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: sw.dur, easing: Easing.inOut(Easing.sin) })), -1, true);
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${sw ? t.value * sw.deg : 0}deg` }] as Transform }));
  const svg = (
    <Svg width={w} height={h}>
      <Defs>
        <SvgGrad id="reef-sand" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f1e7cd" />
          <Stop offset="1" stopColor="#d6c7a1" />
        </SvgGrad>
      </Defs>
      <G transform={`translate(${offX} ${offY}) scale(${sc})`}>{layer.el}</G>
    </Svg>
  );
  if (!sw) return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{svg}</View>;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: `${offX + sw.x * sc}px ${offY + sw.y * sc}px` } as any, a]}>
      {svg}
    </Animated.View>
  );
}

/* ---------------- the tank ---------------- */

/** `onFish`: tapping a drawn animal opens its details. */
export function TankScene({ type, size = "m", stock, height = 210, onFish }: { type: TankType; size?: SizeId; stock?: Critter[]; height?: number; onFish?: (c: Critter) => void }) {
  const salt = chemOf(type) === "salt";
  const look = salt ? "salt" : type === "planted" ? "planted" : "fresh";
  const animals = stock || STOCK[chemOf(type)];
  const [w, setW] = useState(0);

  // The canvas fills the width and keeps its bottom on the substrate; this maps canvas units to points.
  const sc = Math.max(w / VW, 1);
  const offX = (w - VW * sc) / 2;
  const offY = height - VH * sc;
  const px = (x: number) => offX + x * sc;
  const py = (y: number) => offY + y * sc;
  const k = SIZE_K[size] * sc;
  const layers = useMemo(() => (salt ? reefLayers() : freshLayers(look === "planted")), [salt, look]);
  // one clock for every resting animal's idle motion
  const clock = useSharedValue(0);
  useEffect(() => { clock.value = withRepeat(withTiming(Math.PI * 2 * 10, { duration: 34000, easing: Easing.linear }), -1, false); }, []);

  // Lay out each animal from its species' places, keeping the swimming count inside the budget.
  let swimmers = 0;
  const placed: { art: string; p: Place; key: string; c: Critter }[] = [];
  animals.forEach((c) => {
    const spots = PLACES[c.art] || [{ mode: "swim", x0: 40, x1: 360, y: 110, size: 26, dur: 7000 } as Swim];
    spots.slice(0, Math.max(1, Math.min(c.qty, spots.length))).forEach((p, i) => {
      if (p.mode === "swim") { if (swimmers >= MAX_SWIMMERS) return; swimmers++; }
      placed.push({ art: c.art, p, key: c.art + i, c });
    });
  });
  const names = animals.map((c) => c.name.toLowerCase()).join(", ");

  return (
    <View style={{ height, overflow: "hidden" }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View accessible accessibilityRole="image" accessibilityLabel={`Drawing of your ${salt ? "reef" : look === "planted" ? "planted" : "freshwater"} tank with ${names}`} style={StyleSheet.absoluteFill} />
      <Svg width="100%" height={height} viewBox={`0 0 ${VW} ${height}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGrad id={`water-${look}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={WATER[look][0]} />
            <Stop offset="0.5" stopColor={WATER[look][1]} />
            <Stop offset="1" stopColor={WATER[look][2]} />
          </SvgGrad>
        </Defs>
        <Rect x={0} y={0} width={VW} height={height} fill={`url(#water-${look})`} />
      </Svg>
      {w ? layers.map((l, i) => <SceneLayer key={look + i} layer={l} w={w} h={height} sc={sc} offX={offX} offY={offY} />) : null}
      {w ? placed.map(({ art, p, key, c }) => p.mode === "swim" ? (
        <Swimmer key={key} art={art} label={`${c.name}, tap for details`} onPress={onFish ? () => onFish(c) : undefined} x0={px(p.x0)} x1={px(p.x1)} y={py(p.y)} size={p.size * k} dur={p.dur} delay={p.delay} bob={p.bob} meander={(p.meander || 0) * sc} />
      ) : (
        <Rester key={key} art={art} label={`${c.name}, tap for details`} onPress={onFish ? () => onFish(c) : undefined} x={px(p.x)} y={py(p.y)} size={p.size * k} flip={p.flip} clock={clock} phase={key.length * 1.7 + p.x * 0.05} ground={p.y >= 188} />
      )) : null}
    </View>
  );
}
