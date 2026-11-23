// Species illustrations. One shared style so every animal reads as part of the same set:
// side view facing left on a 48 x 32 canvas, fins drawn behind the body, markings clipped
// to the body, a thin darker outline, and the same eye on every animal.
// Colours here are the animals' own colours (artwork), not UI colours, so they live here
// rather than in theme.ts.

export type Part = { d: string; fill?: string; stroke?: string; w?: number; o?: number };
export type Dot = [x: number, y: number, r: number, fill: string];
export type SpeciesSpec = {
  body: string; // closed outline, also used as the clip for marks and dots
  base: string; // body colour
  line: string; // outline colour for body and fins
  behind?: Part[]; // tail and fins, drawn under the body
  marks?: Part[]; // stripes and patches, clipped to the body
  dots?: Dot[]; // spots, clipped to the body
  front?: Part[]; // pectoral fins, antennae, barbels, legs
  eye: [x: number, y: number, r?: number];
};

const BODY_OVAL = "M5 17C6 10 13 7 21 7c7 0 12 3 16 7v5c-4 4-9 7-16 7C13 26 6 23 5 17z";
const SHRIMP_BODY = "M7 15c2-4 8-6 16-6 7 0 12 2 15 5l3 4c-2 1-4 1-6 0l-1-1c-3 3-8 4-12 4-7 0-13-2-15-6z";
const SHRIMP_TAIL = "M36 17c3-1 6-2 9-2 0 3-1 6-2 8-2 0-5-2-7-4z";
const SHRIMP_LEGS = "M14 20l-1 5M18 21l-1 5M22 21l0 5M26 20l1 5M30 19l1 4";
const SNAIL_FOOT = "M5 27c1-2 4-3 8-3h24c3 0 6 1 7 3z";

export const SPECIES: Record<string, SpeciesSpec> = {
  // Ocellaris clownfish: orange with three white bands edged in black, black-tipped fins.
  clown: {
    body: BODY_OVAL, base: "#F97316", line: "#7C2D12",
    behind: [
      { d: "M36 14c3-3 6-5 8-5 1 4 1 10 0 14-2 0-5-2-8-5z", fill: "#F97316" },
      { d: "M13 9c3-5 9-6 14-4 3 1 5 3 6 6", fill: "#F97316" },
      { d: "M18 25c1 3 3 5 6 5 0-2-1-4-2-5z", fill: "#F97316" },
    ],
    marks: [
      { d: "M10 3c3 8 3 18 0 27h4.5c3-9 3-19 0-27z", fill: "#F8FAFC", stroke: "#111827", w: 0.8 },
      { d: "M20 3c2.5 8 2.5 18 0 27h5c2.5-9 2.5-19 0-27z", fill: "#F8FAFC", stroke: "#111827", w: 0.8 },
      { d: "M32 3c1.5 8 1.5 18 0 27h3.2c1.5-9 1.5-19 0-27z", fill: "#F8FAFC", stroke: "#111827", w: 0.8 },
    ],
    front: [{ d: "M15 18c2 3 5 4 7 3-1-2-3-3-7-3z", fill: "#F97316" }],
    eye: [8.5, 15],
  },
  // Yellow watchman goby: long yellow body, two dorsal fins, small blue spots.
  goby: {
    body: "M4 18c0-5 4-8 10-8h16c5 0 9 2 12 5v3c-3 3-7 5-12 5H13c-6 0-9-2-9-5z", base: "#FACC15", line: "#854D0E",
    behind: [
      { d: "M41 15c2-2 4-3 5-3 .5 3 .5 7 0 9-1 0-3-1-5-3z", fill: "#FACC15" },
      { d: "M15 10.5c1-3 4-5 7-4l-1 4z", fill: "#FDE047" },
      { d: "M24 10.5c4-3 10-3 14 1.5", fill: "#FDE047" },
      { d: "M25 22c4 3 9 3 13-1", fill: "#FDE047" },
    ],
    dots: [[12, 15, 0.7, "#60A5FA"], [16, 18, 0.7, "#60A5FA"], [20, 14, 0.7, "#60A5FA"], [24, 18, 0.7, "#60A5FA"], [28, 14, 0.7, "#60A5FA"], [32, 17, 0.7, "#60A5FA"], [36, 15, 0.7, "#60A5FA"], [7, 19, 0.7, "#60A5FA"]],
    front: [{ d: "M12 19c2 3 5 4 7 3-1-2-3-3-7-3z", fill: "#FDE047" }],
    eye: [8, 13.5],
  },
  // Banggai cardinalfish: silver, three black bars, tall fins, white spots.
  cardinal: {
    body: "M5 16c1-6 7-9 14-9 6 0 11 3 15 7v4c-4 4-9 7-15 7-7 0-13-3-14-9z", base: "#CBD5E1", line: "#334155",
    behind: [
      { d: "M33 14L43 6c-1.5 4-2 7-1 10-1 3-.5 6 1 10L33 18z", fill: "#94A3B8" },
      { d: "M13 8C14 3 17 1 20 1c-1 3-1 5 0 7z", fill: "#1E293B" },
      { d: "M22 8c2-5 6-7 9-7-1 3-2 6-3 9z", fill: "#94A3B8" },
      { d: "M20 24c2 5 6 7 9 7-1-2-2-5-4-8z", fill: "#94A3B8" },
    ],
    marks: [
      { d: "M7 3h3.2v28H7z", fill: "#0F172A" },
      { d: "M16.5 3h4.2v28h-4.2z", fill: "#0F172A" },
      { d: "M29 3h3v28h-3z", fill: "#0F172A" },
    ],
    dots: [[24, 12, 0.7, "#F8FAFC"], [26, 17, 0.7, "#F8FAFC"], [23, 21, 0.7, "#F8FAFC"], [34, 15, 0.6, "#F8FAFC"], [13, 20, 0.6, "#F8FAFC"]],
    front: [{ d: "M13 23c0 4 1 6 3 7 0-3 0-5-1-7z", fill: "#1E293B" }],
    eye: [8.6, 14],
  },
  // Skunk cleaner shrimp: orange-red with a white stripe down the back, long white antennae.
  cleaner: {
    body: SHRIMP_BODY, base: "#FB923C", line: "#7F1D1D",
    behind: [{ d: SHRIMP_TAIL, fill: "#DC2626" }],
    marks: [
      { d: "M5 6h40v7.5C33 9.5 18 9 5 13z", fill: "#DC2626" },
      { d: "M8 12.5c6-3 18-4 30 0", stroke: "#F8FAFC", w: 1.6 },
    ],
    front: [
      { d: SHRIMP_LEGS, stroke: "#FED7AA", w: 0.8 },
      { d: "M8 13C5 9 4 5 3 1M8 14C4 12 2 11 0 11", stroke: "#F8FAFC", w: 0.8 },
    ],
    eye: [9, 13, 1.5],
  },
  // Turbo snail: olive spiral shell on a pale foot.
  turbo: {
    body: "M11 24c0-10 6-17 14-17s14 7 14 17z", base: "#A3A380", line: "#4D4D33",
    behind: [{ d: SNAIL_FOOT, fill: "#E7E5E4" }],
    marks: [
      { d: "M14 24c1-6 5-10 11-10s10 4 11 10", stroke: "#6B6B4A", w: 1.2 },
      { d: "M18 24c1-4 3-6 7-6s6 2 7 6", stroke: "#6B6B4A", w: 1.2 },
      { d: "M22 11c3 2 5 4 6 7M17 15c3 1 5 3 6 6M30 12c1 3 1 6 0 9", stroke: "#C9C9A8", w: 0.8 },
    ],
    front: [{ d: "M8 25L4 19M10 25L8 18", stroke: "#E7E5E4", w: 1 }],
    eye: [4, 19, 1.2],
  },
  // Neon tetra: slim silver fish, glowing blue stripe, red rear belly.
  neon: {
    body: "M4 16c2-5 8-7 16-7 7 0 12 2 17 5v4c-5 3-10 5-17 5-8 0-14-2-16-7z", base: "#CBD5E1", line: "#334155",
    behind: [
      { d: "M36 14L44 8c-1 3-1.5 6-.5 8-1 2-.5 5 .5 8L36 18z", fill: "#E2E8F0", o: 0.85 },
      { d: "M19 9.5c1-3 3-4 5-4 0 2-1 3-1 4.5z", fill: "#E2E8F0" },
      { d: "M22 22c1 2 3 3 5 3l-1-3z", fill: "#E2E8F0" },
    ],
    marks: [
      { d: "M17 17.5c6 0 14-.5 22-1.5V27H17z", fill: "#EF4444" },
      { d: "M6 14c8-1.8 20-2 32-.5v2.6c-12-1-24-1-32 .7z", fill: "#22D3EE" },
    ],
    eye: [8, 14.5],
  },
  // Panda corydoras: pale armoured catfish, black eye patch, black dorsal, black tail spot, barbels.
  panda: {
    body: "M5 19c0-6 5-11 13-11 7 0 13 3 19 7v4c-5 3-10 5-17 5-9 0-15-1-15-5z", base: "#F1F5F9", line: "#475569",
    behind: [
      { d: "M36 15l8-6c-1 4-1 10 0 14l-8-5z", fill: "#E2E8F0" },
      { d: "M15 9.5c1-5 4-7 8-7-1 3-2 5-2 7z", fill: "#0F172A" },
      { d: "M31 12c1-1 3-1 4 0z", fill: "#E2E8F0" },
    ],
    marks: [
      { d: "M5 7h8.5v18H5z", fill: "#0F172A" },
      { d: "M31 9h6v14h-6z", fill: "#0F172A" },
      { d: "M14 12c5-1 12 0 18 2", stroke: "#CBD5E1", w: 0.6 },
      { d: "M14 17c5-1 12 0 18 1", stroke: "#CBD5E1", w: 0.6 },
    ],
    front: [
      { d: "M12 22c1 3 3 4 5 4l-1-4z", fill: "#E2E8F0" },
      { d: "M5 21l-3 2M6 22l-2 3", stroke: "#CBD5E1", w: 0.7 },
    ],
    eye: [9, 15],
  },
  // Bristlenose pleco: dark brown, light spots, sail dorsal, bristles on the snout.
  pleco: {
    body: "M3 22c1-7 7-12 16-12 8 0 14 3 20 6v4c-6 2-12 4-20 4C11 24 5 24 3 22z", base: "#57534E", line: "#1C1917",
    behind: [
      { d: "M38 16l7-4c-.5 4-.5 10 0 14l-7-4z", fill: "#44403C" },
      { d: "M14 10.5c3-5 9-7 14-6-2 3-4 5-5 7z", fill: "#44403C" },
    ],
    dots: [[10, 17, 0.8, "#D6D3D1"], [15, 14, 0.8, "#D6D3D1"], [19, 19, 0.8, "#D6D3D1"], [24, 14, 0.8, "#D6D3D1"], [28, 19, 0.8, "#D6D3D1"], [33, 16, 0.8, "#D6D3D1"], [37, 19, 0.7, "#D6D3D1"], [22, 22, 0.7, "#D6D3D1"]],
    front: [
      { d: "M9 22c2 3 6 5 10 5l-3-4z", fill: "#44403C" },
      { d: "M4 17l-2.5-2M5.5 15l-1-3M7.5 13.5l.5-3", stroke: "#A8A29E", w: 0.8 },
    ],
    eye: [9, 15],
  },
  // Amano shrimp: see-through grey-blue body with lines of small brown dashes.
  amano: {
    body: SHRIMP_BODY, base: "#94A3B8", line: "#334155",
    behind: [{ d: SHRIMP_TAIL, fill: "#94A3B8" }],
    marks: [
      { d: "M10 13h28", stroke: "#78350F", w: 0.9, o: 0.9 },
      { d: "M10 16.5h28", stroke: "#78350F", w: 0.9, o: 0.7 },
    ],
    dots: [[11, 19, 0.5, "#78350F"], [15, 19.5, 0.5, "#78350F"], [19, 20, 0.5, "#78350F"], [23, 20, 0.5, "#78350F"], [27, 19.5, 0.5, "#78350F"]],
    front: [
      { d: SHRIMP_LEGS, stroke: "#CBD5E1", w: 0.8 },
      { d: "M8 13C5 9 4 6 2 3M8 14C5 13 3 13 1 14", stroke: "#CBD5E1", w: 0.8 },
    ],
    eye: [9, 13, 1.5],
  },
  // Zebra nerite snail: round golden shell with black zigzag stripes.
  nerite: {
    body: "M12 24c-1-9 4-16 13-16 8 0 13 7 12 16z", base: "#CA8A04", line: "#422006",
    behind: [{ d: SNAIL_FOOT, fill: "#D6D3D1" }],
    marks: [
      { d: "M14 22l3-5 2 4 3-7 2 5 3-8 2 6 3-6 2 5 2-3", stroke: "#1C1917", w: 1.3 },
      { d: "M14 15l3-3 2 3 3-5 2 3 3-5 2 4 3-3", stroke: "#1C1917", w: 1.3 },
    ],
    front: [{ d: "M8 25L4 20M10 25L8 19", stroke: "#D6D3D1", w: 1 }],
    eye: [4, 20, 1.2],
  },
  // Firefish goby: pale yellow head fading to red at the back, very tall first dorsal fin.
  firefish: {
    body: "M4 16c2-4 7-6 14-6h12c5 0 9 2 12 5v2c-3 3-7 5-12 5H18c-7 0-12-2-14-6z", base: "#FEF3C7", line: "#7F1D1D",
    behind: [
      { d: "M41 15c2-2 4-3 5-3 .5 3 .5 6 0 8-1 0-3-1-5-3z", fill: "#F43F5E" },
      { d: "M13 10.5C13 6 13.5 2 15 0c1 3 1.5 7 1.5 10.5z", fill: "#FDE68A" },
      { d: "M22 10.5c4-2 12-2 17 2", fill: "#F43F5E" },
      { d: "M24 21.5c4 2 11 2 15-2", fill: "#F43F5E" },
    ],
    marks: [
      { d: "M3 4h8v26H3z", fill: "#FDE047" },
      { d: "M22 4h7v26h-7z", fill: "#FB923C", o: 0.75 },
      { d: "M29 4h20v26H29z", fill: "#F43F5E" },
    ],
    eye: [8, 14.5],
  },
  // Royal gramma: purple front half, yellow back half, black spot on the dorsal fin.
  gramma: {
    body: "M5 16c1-5 7-8 14-8 7 0 12 2 17 6v4c-5 4-10 6-17 6-7 0-13-3-14-8z", base: "#A855F7", line: "#3B0764",
    behind: [
      { d: "M35 14c3-2 6-4 9-4 1 4 1 8 0 12-3 0-6-2-9-4z", fill: "#FACC15" },
      { d: "M11 8.5c5-3 15-4 23 1.5", fill: "#A855F7" },
      { d: "M22 23.5c5 3 10 2 13-2", fill: "#FACC15" },
    ],
    marks: [
      { d: "M21 3c2 8 2 18 0 28h30V3z", fill: "#FACC15" },
      { d: "M4 13.5l6 0", stroke: "#1E1B4B", w: 0.8 },
    ],
    front: [{ d: "M14 7.2a1.4 1.4 0 1 0 .1 0z", fill: "#111827" }],
    eye: [9, 14],
  },
  // Mandarin dragonet: blue body with orange wavy lines, big rounded fins.
  mandarin: {
    body: "M4 17c1-5 6-8 13-8 8 0 14 3 20 6v4c-6 3-12 5-20 5-7 0-12-2-13-7z", base: "#2563EB", line: "#172554",
    behind: [
      { d: "M36 15c3-2 6-3 9-2 1 3 1 6 0 9-3 1-6 0-9-2z", fill: "#F97316" },
      { d: "M14 9.5c1-5 5-7 9-6-1 2-2 4-2 6z", fill: "#22D3EE" },
      { d: "M22 9.5c4-3 11-3 15 1.5", fill: "#2563EB" },
    ],
    marks: [
      { d: "M4 13c4-2 6 2 10 0s6-2 10 0 6 2 10 0", stroke: "#F97316", w: 1.3 },
      { d: "M4 18c4-2 6 2 10 0s6-2 10 0 6 2 10 0", stroke: "#F97316", w: 1.3 },
      { d: "M7 22.5c4-2 6 2 10 0s6-2 10 0", stroke: "#F97316", w: 1.3 },
      { d: "M8 10.5c4-1 8 1 12 0", stroke: "#22D3EE", w: 1 },
    ],
    front: [{ d: "M14 19c2 4 7 6 11 4-3-2-6-4-11-4z", fill: "#F97316" }],
    eye: [8.5, 14.5],
  },
  // Coral beauty angelfish: deep body, orange centre, blue-violet edges, thin dark bars.
  coralbeauty: {
    body: "M5 16c1-7 8-11 16-11 7 0 12 4 15 9v4c-3 5-8 9-15 9-8 0-15-4-16-11z", base: "#4F46E5", line: "#1E1B4B",
    behind: [
      { d: "M35 13c3-2 6-3 9-2 1 4 1 6 0 10-3 1-6 0-9-2z", fill: "#4338CA" },
      { d: "M11 7c5-5 17-6 25 4", fill: "#4338CA" },
      { d: "M13 25.5c6 5 16 4 23-4", fill: "#4338CA" },
    ],
    marks: [
      { d: "M9 16c2-5 8-7 14-6 5 1 9 4 9 7s-5 6-10 6c-7 0-12-3-13-7z", fill: "#FB923C" },
      { d: "M14 6v20M18 5v22M22 5v22M26 6v20M30 8v16", stroke: "#312E81", w: 0.5, o: 0.8 },
    ],
    eye: [9, 14],
  },
  // Harlequin rasbora: copper-orange with a black triangle patch toward the tail.
  rasbora: {
    body: "M4 16c2-5 8-8 15-8 8 0 13 3 18 6v4c-5 3-10 6-18 6-7 0-13-3-15-8z", base: "#FB923C", line: "#7C2D12",
    behind: [
      { d: "M36 14L44 7c-1 3-1.5 7-.5 9-1 2-.5 6 .5 9L36 18z", fill: "#F97316", o: 0.9 },
      { d: "M19 8.5c1-3 4-5 7-4-1 2-2 3-2 5z", fill: "#F97316" },
      { d: "M21 23c1 2 4 4 7 3l-2-4z", fill: "#F97316" },
    ],
    marks: [
      { d: "M4 4h14v26H4z", fill: "#FDBA74", o: 0.6 },
      { d: "M20 11L37 13.5V19L22 22z", fill: "#111827" },
    ],
    eye: [8, 14.5],
  },
  // Honey gourami: honey-orange, long dorsal and anal fins, thread-like belly fins.
  gourami: {
    body: "M5 16c1-5 6-8 13-8 8 0 14 3 18 6v4c-4 3-10 6-18 6-7 0-12-3-13-8z", base: "#F59E0B", line: "#78350F",
    behind: [
      { d: "M35 14c3-2 6-3 9-2 1 3 1 6 0 9-3 1-6 0-9-2z", fill: "#FBBF24" },
      { d: "M17 8.5c4-2 12-2 18 3", fill: "#FBBF24" },
      { d: "M10 21c8 5 18 5 25-1", fill: "#B45309" },
    ],
    marks: [{ d: "M4 19c4 3 9 5 15 5v8H4z", fill: "#B45309", o: 0.55 }],
    front: [{ d: "M12 21c3 4 6 8 10 10", stroke: "#FCD34D", w: 0.8 }],
    eye: [8.5, 14.5],
  },
  // Otocinclus: small slim tan catfish, dark side stripe, pale belly, dark spot at the tail.
  otocinclus: {
    body: "M3 18c1-5 6-8 13-8h12c6 0 10 2 13 5v3c-3 2-7 4-13 4H14c-6 0-10-1-11-4z", base: "#A3A380", line: "#3F3F2E",
    behind: [
      { d: "M40 15l6-4c-.5 4-.5 9 0 12l-6-4z", fill: "#A3A380" },
      { d: "M16 10.5c1-4 4-5 7-5-1 2-2 4-2 5z", fill: "#A3A380" },
    ],
    marks: [
      { d: "M3 19h40v10H3z", fill: "#E7E5E4" },
      { d: "M3 15.6h40v2.4H3z", fill: "#3F3F2E" },
      { d: "M36 13h4v8h-4z", fill: "#3F3F2E" },
    ],
    front: [{ d: "M10 21c2 2 4 3 6 3l-1-3z", fill: "#A3A380" }],
    eye: [7.5, 14],
  },
  // Kuhli loach: long eel-like body, yellow with dark saddle bands, tiny barbels.
  kuhli: {
    body: "M3 16c0-3 2-4 5-4h28c4 0 7 1 9 3 1 1 1 2 0 3-2 2-5 3-9 3H8c-3 0-5-2-5-5z", base: "#EAB308", line: "#422006",
    behind: [{ d: "M43 14c1.5-1 3-1 4-.5.3 2 .3 4 0 5.5-1 .5-2.5.5-4-.5z", fill: "#A16207" }],
    marks: [
      { d: "M9 10h3.4v12H9zM15 10h3.4v12H15zM21 10h3.4v12H21zM27 10h3.4v12H27zM33 10h3.4v12H33zM39 10h3.4v12H39z", fill: "#3B2F1E" },
      { d: "M3 18.5h44v6H3z", fill: "#FDE68A", o: 0.6 },
    ],
    front: [{ d: "M3.5 17l-2 1.5M4 18l-1 2", stroke: "#FDE68A", w: 0.6 }],
    eye: [6, 14.6, 1.3],
  },
};

/** Fallback when an animal has no drawing yet. */
export const FALLBACK = "clown";
