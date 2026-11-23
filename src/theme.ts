// Design tokens from the Stitch "Oceanic Telemetry Console" system (reference/stitch/DESIGN.md).
import { Platform, TextStyle } from "react-native";

export const C = {
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
  ok: "#10B981",
  okTint: "rgba(16,185,129,0.12)",
  warn: "#F59E0B",
  warnTint: "rgba(245,158,11,0.12)",
  crit: "#F43F5E",
  critTint: "rgba(244,63,94,0.12)",
};

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

export const T: Record<string, TextStyle> = {
  h1: { fontFamily: F.head600, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: C.ink },
  h2: { fontFamily: F.head600, fontSize: 19, lineHeight: 25, letterSpacing: -0.2, color: C.ink },
  h3: { fontFamily: F.head600, fontSize: 16, lineHeight: 21, color: C.ink },
  body: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.ink },
  body2: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: C.ink2 },
  small: { fontFamily: F.body, fontSize: 12, lineHeight: 17, color: C.muted },
  label: { fontFamily: F.body600, fontSize: 10, lineHeight: 13, letterSpacing: 1, textTransform: "uppercase", color: C.muted },
  mono: { fontFamily: F.mono, fontSize: 13, color: C.ink },
};

// Spring presets so every motion in the app feels like one system.
export const SPRING = { damping: 18, stiffness: 220, mass: 0.8 };
export const SPRING_SOFT = { damping: 20, stiffness: 140, mass: 1 };
