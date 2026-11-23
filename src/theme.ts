// Design tokens from the Stitch "Oceanic Telemetry Console" system (reference/stitch/DESIGN.md).
// Two palettes share the same token names. `C` and `T` always hold the active theme, so screens
// keep using `C.primary` etc. and pick up the new colours on the next render after `applyTheme`.
import { Platform, TextStyle } from "react-native";

export const DARK = {
  bg: "#061426",
  sLow: "#0e1c2f",
  s: "#132033",
  sHigh: "#1d2a3e",
  sTop: "#28354a",
  ink: "#d6e3fe",
  ink2: "#bacac9",
  muted: "#94A3B8",
  faint: "#64748B",
  white: "#F8FAFC",
  line: "rgba(56,189,248,0.16)",
  line2: "rgba(148,163,184,0.22)",
  hair: "rgba(255,255,255,0.06)",
  primary: "#00D2D3",
  primaryHi: "#48efef",
  onPrimary: "#061426",
  primaryTint: "rgba(0,210,211,0.10)",
  primaryGlow: "rgba(0,210,211,0.35)",
  tertiary: "#38BDF8",
  tertTint: "rgba(56,189,248,0.12)",
  secondary: "#1E3E62",
  glass: "rgba(30,62,98,0.25)",
  glass2: "rgba(30,62,98,0.5)",
  input: "rgba(11,25,44,0.6)",
  sel: "rgba(30,62,98,0.45)", // background of a selected card or option
  radioOff: "#3b4949", // border of an unselected radio
  tabBg: "rgba(6,20,38,0.82)", // tab bar over the blur
  scrim: "rgba(0,0,0,0.6)", // behind bottom sheets
  shadow: "#000",
  ok: "#10B981",
  okTint: "rgba(16,185,129,0.12)",
  warn: "#F59E0B",
  warnTint: "rgba(245,158,11,0.12)",
  crit: "#F43F5E",
  critTint: "rgba(244,63,94,0.12)",
};
export type Palette = typeof DARK;

// Daylight version of the same system: lagoon-white canvas, white glass panels, a deeper cyan so
// text and buttons keep their contrast on light surfaces, status colours one step darker.
export const LIGHT: Palette = {
  bg: "#EEF4F9",
  sLow: "#E4ECF4",
  s: "#FFFFFF",
  sHigh: "#E3EBF3",
  sTop: "#D5E0EB",
  ink: "#0B1B2E",
  ink2: "#334155",
  muted: "#5B6B80",
  faint: "#8A99AD",
  white: "#F8FAFC",
  line: "rgba(8,145,178,0.22)",
  line2: "rgba(71,85,105,0.22)",
  hair: "rgba(11,27,46,0.08)",
  primary: "#0891B2",
  primaryHi: "#0E7490",
  onPrimary: "#FFFFFF",
  primaryTint: "rgba(8,145,178,0.10)",
  primaryGlow: "rgba(8,145,178,0.25)",
  tertiary: "#0284C7",
  tertTint: "rgba(2,132,199,0.10)",
  secondary: "#D6EEF5",
  glass: "rgba(255,255,255,0.75)",
  glass2: "rgba(255,255,255,0.92)",
  input: "#F5F8FB",
  sel: "rgba(8,145,178,0.08)",
  radioOff: "#94A3B8",
  tabBg: "rgba(255,255,255,0.86)",
  scrim: "rgba(11,27,46,0.35)",
  shadow: "#0B1B2E",
  ok: "#059669",
  okTint: "rgba(5,150,105,0.12)",
  warn: "#B45309",
  warnTint: "rgba(217,119,6,0.12)",
  crit: "#E11D48",
  critTint: "rgba(225,29,72,0.10)",
};

export type ThemeMode = "dark" | "light";
export type ThemePref = ThemeMode | "system";

/** The active palette. Mutated in place by applyTheme. */
export const C: Palette = { ...DARK };

export const F = {
  head500: "SpaceGrotesk_500Medium",
  head600: "SpaceGrotesk_600SemiBold",
  head700: "SpaceGrotesk_700Bold",
  body: "Inter_400Regular",
  body500: "Inter_500Medium",
  body600: "Inter_600SemiBold",
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as string,
};

export const R = { sm: 4, md: 6, lg: 8, xl: 12 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

const makeT = (): Record<string, TextStyle> => ({
  h1: { fontFamily: F.head600, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: C.ink },
  h2: { fontFamily: F.head600, fontSize: 19, lineHeight: 25, letterSpacing: -0.2, color: C.ink },
  h3: { fontFamily: F.head600, fontSize: 16, lineHeight: 21, color: C.ink },
  body: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.ink },
  body2: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: C.ink2 },
  small: { fontFamily: F.body, fontSize: 12, lineHeight: 17, color: C.muted },
  label: { fontFamily: F.body600, fontSize: 10, lineHeight: 13, letterSpacing: 1, textTransform: "uppercase", color: C.muted },
  mono: { fontFamily: F.mono, fontSize: 13, color: C.ink },
});
/** Text styles for the active theme. Mutated in place by applyTheme. */
export const T: Record<string, TextStyle> = makeT();

let mode: ThemeMode = "dark";
let version = 0;
export const themeMode = () => mode;
export const isDark = () => mode === "dark";

/** Switch the active palette. Returns true if it changed; the caller re-renders the app. */
export function applyTheme(next: ThemeMode) {
  if (next === mode) return false;
  mode = next;
  Object.assign(C, next === "light" ? LIGHT : DARK);
  Object.assign(T, makeT());
  version++;
  return true;
}

/**
 * A StyleSheet that rebuilds itself after a theme change. Use it for any module-level styles that
 * read `C` or `T`: `const s = themed(() => StyleSheet.create({ ... }))`.
 */
export function themed<S extends Record<string, any>>(build: () => S): S {
  let cache: S = build();
  let built = version;
  return new Proxy({} as S, {
    get(_, key: string) {
      if (built !== version) { cache = build(); built = version; }
      return cache[key];
    },
  });
}

// Spring presets so every motion in the app feels like one system.
export const SPRING = { damping: 18, stiffness: 220, mass: 0.8 };
export const SPRING_SOFT = { damping: 20, stiffness: 140, mass: 1 };
