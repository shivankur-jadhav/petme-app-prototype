import React from "react";
import Svg, { Path } from "react-native-svg";
import { C } from "../theme";

// Stroke icons on a 24px grid. Every shape is a path so they render the same on iOS and Android.
const P: Record<string, string[]> = {
  waves: ["M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0", "M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"],
  cal: ["M5.5 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M3.5 10h17M8 3v4M16 3v4"],
  clock: ["M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z", "M12 7.5V12l3 2"],
  fish: ["M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2z", "M8 11.3v.1"],
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
  pin: ["M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z", "M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"],
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, color = C.ink, width = 1.7 }: { name: string; size?: number; color?: string; width?: number }) {
  const paths = P[name] || [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths.map((d, i) => (
        <Path key={i} d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

export function CritterArt({ kind, color, width = 40 }: { kind: "fish" | "inv"; color: string; width?: number }) {
  const h = (width * 32) / 48;
  if (kind === "inv") {
    return (
      <Svg width={width} height={h} viewBox="0 0 48 32">
        <Path d="M10 26c-4-8 2-18 14-18s18 8 14 16" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Path d="M12 24c4 3 20 3 24 0" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Path d="M38 12l6-6M34 9l3-7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={width} height={h} viewBox="0 0 48 32">
      <Path d="M4 16c6-10 20-12 28-4l10-6v20l-10-6c-8 8-22 6-28-4z" fill={color} />
      <Path d="M14.8 14a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0z" fill={C.bg} />
    </Svg>
  );
}
