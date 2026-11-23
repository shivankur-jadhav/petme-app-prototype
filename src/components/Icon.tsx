import React from "react";
import Svg, { Circle, ClipPath, Defs, G, Path } from "react-native-svg";
import { FALLBACK, Part, SPECIES } from "./speciesArt";
import { C } from "../theme";

// Stroke icons on a 24px grid. Every shape is a path so they render the same on iOS and Android.
const P: Record<string, string[]> = {
  waves: ["M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"],
  cal: ["M5.5 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M3.5 10h17M8 3v4M16 3v4", "M8 13.5v.1M12 13.5v.1M16 13.5v.1M8 17v.1M12 17v.1M16 17v.1"],
  clock: ["M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z", "M12 7.5V12l3 2"],
  fish: ["M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2z", "M8 11.3v.1"],
  // Clownfish outline: body, fan tail, dorsal + pectoral fins, two curved stripes, eye.
  clown: [
    "M3 12C4.5 8.5 7.5 7 11 7c3 0 5 1.3 6.5 3.2v3.6C16 15.7 14 17 11 17c-3.5 0-6.5-1.5-8-5z",
    "M17.5 10.2C18.8 8.6 20.2 7.8 21 8c.6 1.6.6 6.4 0 8-.8.2-2.2-.6-3.5-2.2",
    "M9 7.3c.5-1.8 2.5-2.6 4-1.8.6.3.8 1 .7 1.9",
    "M10 16.8c.3 1.4 1.5 2.1 2.6 1.6",
    "M7.2 8.2c1 2.5 1 5.1 0 7.6M12.6 7.1c1.2 3 1.2 6.8 0 9.8",
    "M5.2 11.3v.1",
  ],
  pro: ["M7 4.5h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z", "M9 3.5h6v3H9z", "M8.5 13l2.2 2.2 4.6-4.6"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  back: ["M15 5l-7 7 7 7"],
  chev: ["M9 5l7 7-7 7"],
  close: ["M6 6l12 12M18 6L6 18"],
  sunrise: ["M4 18h16M7 18a5 5 0 0 1 10 0M12 5v4M5.5 10l1.5 1.5M18.5 10L17 11.5"],
  sun: ["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"],
  moon: ["M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"],
  flask: ["M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"],
  plus: ["M12 5v14M5 12h14"],
  edit: ["M4 20h4L19 9l-4-4L4 16z"],
  note: ["M6 3.5h9l4 4v13H6z", "M9 11h7M9 15h7"],
  drop: ["M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"],
  bolt: ["M13 3L5 14h6l-1 7 8-11h-6z"],
  truck: ["M3 7h11v9H3zM14 10h4l3 3v3h-7", "M8.5 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM18.5 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"],
  tank: ["M4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-9A1.5 1.5 0 0 1 4.5 5z", "M3 9h18M7 17v3M17 17v3"],
  signal: ["M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0", "M12 12v.1"],
  user: ["M15.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z", "M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"],
  pin: ["M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z", "M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"],
};

export type IconName = keyof typeof P;

// Wide, short shapes look smaller than square ones at the same size. Scale them up around the
// centre so every tab icon carries the same visual weight; stroke width is compensated below.
const SCALE: Record<string, number> = { clown: 1.25 };

export function Icon({ name, size = 20, color = C.ink, width = 1.7 }: { name: string; size?: number; color?: string; width?: number }) {
  const paths = P[name] || [];
  const k = SCALE[name] || 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform={k === 1 ? undefined : `translate(12 12) scale(${k}) translate(-12 -12)`}>
        {paths.map((d, i) => (
          <Path key={i} d={d} fill="none" stroke={color} strokeWidth={width / k} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </G>
    </Svg>
  );
}

/** Drawn species illustration (see speciesArt.ts). `art` is a key of SPECIES. */
export function CritterArt({ art, width = 40 }: { art: string; width?: number }) {
  const s = SPECIES[art] || SPECIES[FALLBACK];
  const clip = "clip-" + art + "-" + width;
  const fin = (p: Part, i: number) =>
    p.stroke ? <Path key={i} d={p.d} fill="none" stroke={p.stroke} strokeWidth={p.w || 1} strokeLinecap="round" strokeLinejoin="round" opacity={p.o ?? 1} />
      : <Path key={i} d={p.d} fill={p.fill} stroke={s.line} strokeWidth={0.7} strokeLinejoin="round" opacity={p.o ?? 1} />;
  const mark = (p: Part, i: number) => (
    <Path key={i} d={p.d} fill={p.fill || "none"} stroke={p.stroke} strokeWidth={p.stroke ? p.w || 1 : 0} strokeLinecap="round" strokeLinejoin="round" opacity={p.o ?? 1} />
  );
  const [ex, ey, er = 1.9] = s.eye;
  return (
    <Svg width={width} height={(width * 32) / 48} viewBox="0 0 48 32">
      <Defs><ClipPath id={clip}><Path d={s.body} /></ClipPath></Defs>
      {(s.behind || []).map(fin)}
      <Path d={s.body} fill={s.base} />
      <G clipPath={`url(#${clip})`}>
        {(s.marks || []).map(mark)}
        {(s.dots || []).map(([x, y, r, f], i) => <Circle key={i} cx={x} cy={y} r={r} fill={f} />)}
      </G>
      <Path d={s.body} fill="none" stroke={s.line} strokeWidth={0.9} strokeLinejoin="round" />
      {(s.front || []).map(fin)}
      <Circle cx={ex} cy={ey} r={er} fill="#F8FAFC" />
      <Circle cx={ex - er * 0.15} cy={ey} r={er * 0.58} fill="#0B1220" />
    </Svg>
  );
}
