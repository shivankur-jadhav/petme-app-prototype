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
// `bend` skews instead of rotating: the base stays put and the top moves, like a plant in a current.
// `delay` offsets each clump so nothing moves in lockstep.
type Layer = { el: React.ReactNode; sway?: { x: number; y: number; deg: number; dur: number; bend?: boolean; delay?: number } };

// Small deterministic "random" so plants look natural but draw the same every time.
const rnd = (i: number, salt = 1) => { const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return v - Math.floor(v); };
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16)), pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  return "#" + pa.map((v, k) => Math.round(v + (pb[k] - v) * t).toString(16).padStart(2, "0")).join("");
};

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

/** Eelgrass: long ribbon blades curling at the tips. */
function Vallis({ x0, x1, n, h, salt }: { x0: number; x1: number; n: number; h: number; salt: number }) {
  const greens = ["#3f9d5a", "#58b56e", "#2f7d4a", "#6cc47f", "#4a9a52"];
  return (
    <G>
      {Array.from({ length: n }).map((_, i) => {
        const x = x0 + ((x1 - x0) * i) / Math.max(1, n - 1) + (rnd(i, salt) - 0.5) * 6;
        const hh = h * (0.7 + rnd(i, salt + 1) * 0.35), lean = (rnd(i, salt + 2) - 0.5) * 34;
        return <Path key={i} d={`M${x} 202C${x + lean * 0.2} ${202 - hh * 0.4} ${x + lean * 0.7} ${202 - hh * 0.75} ${x + lean} ${202 - hh}`}
          stroke={greens[i % greens.length]} strokeWidth={3 + rnd(i, salt + 3) * 1.4} strokeLinecap="round" fill="none" opacity={0.92} />;
      })}
    </G>
  );
}

/** Anubias: broad dark leaves with a pale midrib, growing on wood. */
function Anubias({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  const leaves = [[-42, 1], [-14, 1.15], [16, 1.05], [44, 0.9]];
  return (
    <G transform={`translate(${x} ${y}) scale(${k})`}>
      {leaves.map(([a, s], i) => (
        <G key={i} transform={`rotate(${a}) scale(${s})`}>
          <Path d="M0 0v-10" stroke="#2f6b3a" strokeWidth={1.6} />
          <Path d="M0 -8c-9-4-12-18-5-28 3-4 7-4 10 0 7 10 4 24-5 28z" fill={i % 2 ? "#1f6b35" : "#185c2d"} />
          <Path d="M0 -10v-24" stroke="#4f9a5e" strokeWidth={0.9} />
        </G>
      ))}
    </G>
  );
}

/** Java moss: soft fuzzy tufts. */
function Moss({ pts }: { pts: [number, number, number][] }) {
  return (
    <G>
      {pts.flatMap(([cx, cy, r], j) => Array.from({ length: 7 }).map((_, i) => (
        <Circle key={`${j}-${i}`} cx={cx + (rnd(i, j + 5) - 0.5) * r * 2} cy={cy + (rnd(i, j + 9) - 0.5) * r} r={r * (0.35 + rnd(i, j + 13) * 0.3)} fill={i % 3 ? "#4d7c0f" : "#65a30d"} opacity={0.9} />
      )))}
    </G>
  );
}

/** Cryptocoryne: a low rosette of wavy bronze-green leaves. */
function Crypt({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  const cols = ["#6b7d2c", "#8a7a32", "#5d7a33", "#9a7b3c", "#73862f"];
  return (
    <G transform={`translate(${x} ${y}) scale(${k})`}>
      {[-55, -30, -10, 10, 32, 56].map((a, i) => (
        <Path key={i} transform={`rotate(${a})`} d="M0 0c-5-6-7-16-3-26 1-3 3-3 4 0 4 10 3 20-1 26z" fill={cols[i % cols.length]} />
      ))}
    </G>
  );
}

/** Rotala: a feathery bush of slender stems, green at the base turning soft pink at the tips. */
function Rotala({ x0, x1, n }: { x0: number; x1: number; n: number }) {
  return (
    <G>
      {Array.from({ length: n }).map((_, i) => {
        const x = x0 + ((x1 - x0) * i) / (n - 1) + (rnd(i, 21) - 0.5) * 8;
        const h = 100 + rnd(i, 22) * 55, lean = (rnd(i, 23) - 0.5) * 18, leaves = Math.floor(h / 7);
        return (
          <G key={i}>
            <Path d={`M${x} 200Q${x + lean * 0.3} ${200 - h * 0.5} ${x + lean} ${200 - h}`} stroke="#4f7d3a" strokeWidth={1.1} fill="none" />
            {Array.from({ length: leaves }).map((_, j) => {
              const t = j / leaves, yy = 200 - h * t, xx = x + lean * t * t;
              const c = t < 0.6 ? mix("#2f855a", "#5fb36b", t / 0.6) : mix("#5fb36b", "#f2a7b8", (t - 0.6) / 0.4);
              return <G key={j}><Ellipse cx={xx - 3.4} cy={yy} rx={3.4} ry={1.2} fill={c} transform={`rotate(-20 ${xx - 3.4} ${yy})`} /><Ellipse cx={xx + 3.4} cy={yy - 2} rx={3.4} ry={1.2} fill={c} transform={`rotate(20 ${xx + 3.4} ${yy - 2})`} /></G>;
            })}
          </G>
        );
      })}
    </G>
  );
}

/** Floating plants at the surface, with roots trailing down into the water. */
function Floaters({ x0, x1 }: { x0: number; x1: number }) {
  const pads = Array.from({ length: 9 }).map((_, i) => [x0 + ((x1 - x0) * i) / 8 + (rnd(i, 31) - 0.5) * 8, 7 + rnd(i, 32) * 3, 5 + rnd(i, 33) * 3]);
  return (
    <G>
      {pads.map(([x, y, r], i) => <Path key={"r" + i} d={`M${x} ${y + 1}q${(rnd(i, 34) - 0.5) * 6} ${10 + r * 2} ${(rnd(i, 35) - 0.5) * 4} ${18 + r * 3}`} stroke="#d9f99d" strokeWidth={0.7} fill="none" opacity={0.45} />)}
      {pads.map(([x, y, r], i) => <G key={"p" + i}><Ellipse cx={x} cy={y} rx={r} ry={r * 0.36} fill={i % 2 ? "#65a30d" : "#7cb518"} /><Ellipse cx={x - r * 0.2} cy={y - r * 0.08} rx={r * 0.5} ry={r * 0.14} fill="#a3d65c" opacity={0.6} /></G>)}
    </G>
  );
}

function freshLayers(planted: boolean): Layer[] {
  return [
    // soft, out-of-focus plants at the back for depth
    { el: <G opacity={0.28}>
      <Path d="M0 200c10-60 30-90 26-140 12 40 20 90 6 140zM60 200c6-40 22-70 30-110 6 40-2 80-10 110zM210 200c-6-40 4-70 0-96 12 30 16 64 8 96zM260 200c4-30 16-56 30-78 2 30-6 56-16 78z" fill="#0f4a3a" />
    </G> },
    // back-left: rotala bush (planted) or tall eelgrass (freshwater)
    planted
      ? { sway: { x: 50, y: 200, deg: 4, dur: 4300, bend: true }, el: <Rotala x0={10} x1={96} n={9} /> }
      : { sway: { x: 40, y: 202, deg: 6, dur: 3900, bend: true }, el: <Vallis x0={8} x1={74} n={10} h={170} salt={1} /> },
    // back-right eelgrass, on its own rhythm
    { sway: { x: 340, y: 202, deg: -5, dur: 5100, bend: true, delay: 900 }, el: <Vallis x0={300} x1={384} n={planted ? 11 : 9} h={planted ? 160 : 150} salt={2} /> },
    { el: <G>
      <Driftwood small={planted} />
      <Moss pts={planted ? [[88, 168, 6], [118, 150, 5], [140, 132, 5]] : [[60, 178, 6], [104, 154, 6], [142, 112, 5], [160, 98, 4]]} />
    </G> },
    // anubias tied to the wood
    { sway: { x: planted ? 104 : 132, y: planted ? 150 : 122, deg: 2.5, dur: 3300, delay: 400 }, el: <Anubias x={planted ? 104 : 132} y={planted ? 150 : 122} k={planted ? 0.8 : 1} /> },
    ...(planted ? [{ el: <G>
      <Path d="M176 200c-4-20 8-34 24-36 10-8 26-6 32 6 10 4 14 16 12 30z" fill="#6b7280" />
      <Path d="M186 184c8-4 16-2 22 4M204 174c8 0 14 4 18 10M214 192c6-2 12 0 16 4" stroke="#4b5563" strokeWidth={1.4} fill="none" />
      <Moss pts={[[196, 166, 6], [222, 164, 5]]} />
    </G> }] : []),
    // Amazon sword, right-middle
    { sway: { x: 300, y: 202, deg: 3, dur: 4700, bend: true, delay: 1500 }, el: <Sword x={300} y={202} k={planted ? 0.8 : 0.95} /> },
    // cryptocorynes in the foreground
    { sway: { x: 160, y: 200, deg: 2.5, dur: 3600, bend: true, delay: 600 }, el: <G>
      <Crypt x={planted ? 150 : 168} y={200} k={1} />
      <Crypt x={planted ? 262 : 214} y={201} k={0.8} />
      {!planted ? <Crypt x={352} y={201} k={0.75} /> : null}
    </G> },
    // floating plants drifting at the surface
    { sway: { x: 215, y: 8, deg: 1.4, dur: 6200, delay: 300 }, el: <Floaters x0={150} x1={280} /> },
    { el: planted ? (
      <G>
        <Path d="M0 192c50-4 100 2 150-1s100-5 150 0 70 3 100 0V210H0z" fill="#2a2018" />
        {Array.from({ length: 110 }).map((_, i) => {
          const x = (i * 400) / 110 + rnd(i, 41) * 3;
          return <Circle key={i} cx={x} cy={193.5 + rnd(i, 42) * 3} r={1.6 + rnd(i, 43) * 1.3} fill={["#4ade80", "#22c55e", "#86efac", "#16a34a"][i % 4]} />;
        })}
        <Heater />
      </G>
    ) : (
      <G>
        <Path d="M0 190c50-4 100 2 150-1s100-5 150 0 70 3 100 0V210H0z" fill="#5a4b3c" />
        {Array.from({ length: 34 }).map((_, i) => {
          const x = (i * 400) / 34 + rnd(i, 51) * 8, y = 194 + rnd(i, 52) * 9, r = 2.4 + rnd(i, 53) * 3;
          const c = ["#8b7d6b", "#a89b86", "#6b5d4d", "#9c8f7a", "#7a6d5c"][i % 5];
          return <G key={i}><Ellipse cx={x} cy={y} rx={r} ry={r * 0.66} fill={c} /><Ellipse cx={x - r * 0.25} cy={y - r * 0.25} rx={r * 0.4} ry={r * 0.2} fill="#ffffff" opacity={0.12} /></G>;
        })}
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
    t.value = withDelay(sw.delay || 0, withRepeat(withSequence(withTiming(1, { duration: sw.dur, easing: Easing.inOut(Easing.sin) }), withTiming(-1, { duration: sw.dur, easing: Easing.inOut(Easing.sin) })), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [sw?.bend ? { skewX: `${t.value * sw.deg}deg` } : { rotate: `${sw ? t.value * sw.deg : 0}deg` }] as Transform,
  }));
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
