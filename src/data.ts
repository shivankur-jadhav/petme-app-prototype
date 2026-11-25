// Business model, catalogue and helpers. Prices are starter assumptions to validate with real customers.

export type TankType = "fresh" | "planted" | "salt";
export type SizeId = "s" | "m" | "l" | "xl";
export type ServiceId = "clean" | "consult" | "setup" | "move" | "emergency";
export type RecurId = "once" | "w4" | "w2";
export type Status = "new" | "confirmed" | "done" | "cancelled";

/** A video (or photo) of the real tank. Stored as a file on the phone; `uri` points at the saved copy. */
export type TankMedia = { uri: string; kind: "video" | "image"; addedAt: number; by: "customer" | "technician"; ref?: string };

export type Tank = { name: string; type: TankType; size: SizeId; sample: boolean; media?: TankMedia };

/** The customer's own details, saved on the phone and used to fill in bookings. */
export type Profile = {
  name: string; phone: string; email: string;
  street: string; unit: string; postal: string; city: string; access: string;
  smsEta: boolean; reminders: boolean;
  since: number; // first time the profile was saved, 0 if never
};
export const EMPTY_PROFILE: Profile = { name: "", phone: "", email: "", street: "", unit: "", postal: "", city: "Toronto", access: "", smsEta: true, reminders: true, since: 0 };
export const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
export const addressLine = (p: Pick<Profile, "street" | "unit" | "postal">) => [p.unit ? `${p.unit}-${p.street}` : p.street, p.postal.toUpperCase()].filter((x) => x.trim()).join(", ");
export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
export const validPostal = (s: string) => /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(s.trim());
export const phoneOk = (s: string) => s.replace(/\D/g, "").length >= 7;

export type Booking = {
  id: string;
  ref: string;
  service: ServiceId;
  type: TankType;
  size: SizeId;
  tankName: string;
  city: string;
  zone?: string; // only on bookings saved before distance pricing
  km?: number; // estimated one-way km from the base
  recur: RecurId;
  date: string; // YYYY-MM-DD
  win: string;
  name: string;
  phone: string;
  address?: string; // street, unit and postal code for the visit
  notes: string;
  sms: boolean;
  wishlist: string[];
  base: number;
  discAmt: number;
  travel: number; // travel charge, shown inside the service price
  subtotal: number; // service charge before tax
  tax: number;
  total: number; // service charge, paid after the visit
  monthly: number;
  bookFee?: number; // booking charge before tax, paid when booking (missing on bookings saved before this existed)
  bookTax?: number; // 0 on new bookings; older bookings saved on the phone may have HST here
  bookTotal?: number;
  cancelledAt?: number;
  bookRefunded?: boolean; // set on cancel: true when the booking charge went back to the customer
  status: Status;
  example: boolean;
  createdAt: number;
  completedAt?: number;
  results?: Record<string, number>;
  techNotes?: string;
  media?: TankMedia; // tank video the technician recorded at this visit
};

export const SIZES: { id: SizeId; name: string; short: string; gal: number }[] = [
  { id: "s", name: "Up to 30", short: "≤30", gal: 30 },
  { id: "m", name: "31 to 75", short: "31–75", gal: 75 },
  { id: "l", name: "76 to 150", short: "76–150", gal: 150 },
  { id: "xl", name: "Over 150", short: "150+", gal: 200 },
];

export const TYPES: { id: TankType; name: string; short: string; mult: number; chem: "fresh" | "salt" }[] = [
  { id: "fresh", name: "Freshwater", short: "Freshwater", mult: 1, chem: "fresh" },
  { id: "planted", name: "Planted", short: "Planted", mult: 1.1, chem: "fresh" },
  { id: "salt", name: "Saltwater reef", short: "Saltwater", mult: 1.4, chem: "salt" },
];

export const SERVICES: {
  id: ServiceId; icon: string; name: string; tag: string; blurb: string;
  base: Record<SizeId, number>; hours: Record<SizeId, number>; typeMult: boolean;
}[] = [
  { id: "clean", icon: "drop", name: "Routine maintenance", tag: "Water change and full tank care", blurb: "Water test, 20 to 30% water change, glass and decor clean, filter media rinse, equipment check.", base: { s: 85, m: 120, l: 180, xl: 260 }, hours: { s: 1.25, m: 1.75, l: 2.5, xl: 3.5 }, typeMult: true },
  { id: "consult", icon: "flask", name: "Water chemistry and advice", tag: "Full test and a written plan", blurb: "In-home assessment, full water test, stocking and care advice, then a written plan for your tank.", base: { s: 79, m: 79, l: 79, xl: 79 }, hours: { s: 1, m: 1, l: 1, xl: 1 }, typeMult: false },
  { id: "setup", icon: "tank", name: "New tank setup", tag: "From empty stand to cycling tank", blurb: "Placement and leveling, equipment, filling, aquascape, and a cycling plan before fish go in.", base: { s: 180, m: 260, l: 380, xl: 560 }, hours: { s: 2.5, m: 3.5, l: 5, xl: 7 }, typeMult: true },
  { id: "move", icon: "truck", name: "Tank move", tag: "Livestock kept safe the whole way", blurb: "Bag livestock in tank water, drain and pack, transport, re-level and refill at the new address.", base: { s: 280, m: 380, l: 520, xl: 760 }, hours: { s: 3, m: 4, l: 6, xl: 8 }, typeMult: true },
  { id: "emergency", icon: "bolt", name: "Emergency visit", tag: "Leaks, crashes, failed equipment", blurb: "Same or next day. Stop the problem, test the water, move livestock to safety if needed.", base: { s: 150, m: 170, l: 200, xl: 240 }, hours: { s: 1.5, m: 1.5, l: 1.5, xl: 1.5 }, typeMult: false },
];

const TASKS: Record<ServiceId, string[]> = {
  clean: ["Water test: ammonia, nitrite, nitrate, pH", "Partial water change, 20 to 30%", "Glass, decor and gravel cleaning", "Filter media rinse in tank water", "Equipment check: heater, pumps, lights", "Livestock health check"],
  consult: ["Tank and equipment review", "Full water test", "Stocking and feeding discussion", "Written care plan sent"],
  setup: ["Site check: level floor, power, stand", "Tank and equipment placement", "Fill and condition water", "Filter, heater and lighting set up", "Aquascape", "Cycling plan explained"],
  move: ["Livestock bagged in tank water", "Drain, pack equipment, save water", "Transport to new address", "Re-level and refill", "Equipment restart and leak check", "Livestock acclimated"],
  emergency: ["Find and stop the problem", "Emergency water test", "Livestock moved to safety if needed", "Repair or replace equipment", "Follow-up plan agreed"],
};
const SALT_TASKS = ["Protein skimmer cup cleaned", "Salinity checked and topped off"];

export const RECUR: { id: RecurId; name: string; sub: string; disc: number; perMonth: number }[] = [
  { id: "once", name: "One visit", sub: "No plan", disc: 0, perMonth: 0 },
  { id: "w4", name: "Every 4 wks", sub: "8% off", disc: 0.08, perMonth: 13 / 12 },
  { id: "w2", name: "Every 2 wks", sub: "12% off", disc: 0.12, perMonth: 26 / 12 },
];

export const WINDOWS = [
  { id: "am", icon: "sunrise", name: "9:00 AM – 12:00 PM", start: "9:00 AM", hour: 9, sub: "Morning window" },
  { id: "mid", icon: "sun", name: "12:00 PM – 3:00 PM", start: "12:00 PM", hour: 12, sub: "Midday window" },
  { id: "pm", icon: "moon", name: "3:00 PM – 6:00 PM", start: "3:00 PM", hour: 15, sub: "Late afternoon window" },
];

/* ---------- travel: charged by distance from the PetMe base ---------- */
// Technicians start from Bramalea City Centre in Brampton. Each city is priced from its centre,
// so the distance is an estimate until we geocode real addresses.
export const BASE = { name: "Bramalea City Centre", lat: 43.7166, lng: -79.7234 };
/** City centres [lat, lng]. Order is the order shown in the city picker. */
export const CITIES: Record<string, [number, number]> = {
  Brampton: [43.6831, -79.7663], Mississauga: [43.589, -79.6441], Toronto: [43.6532, -79.3832], Vaughan: [43.8361, -79.4983],
  "Halton Hills": [43.647, -79.903], Milton: [43.5183, -79.8774], Oakville: [43.4675, -79.6877], King: [43.926, -79.528],
  "Richmond Hill": [43.8828, -79.4403], Markham: [43.8561, -79.337], Burlington: [43.3255, -79.799], Aurora: [44.0065, -79.4504],
  Newmarket: [44.0592, -79.4613], "Whitchurch-Stouffville": [43.971, -79.245], Pickering: [43.8384, -79.0868], Ajax: [43.8509, -79.0204],
  Whitby: [43.8975, -78.9429], Oshawa: [43.8971, -78.8658],
};
export const ROAD_FACTOR = 1.3; // straight-line distance x 1.3 ~ driving distance in the GTA
export const TRAVEL_FREE_KM = 10; // no travel charge within this many km of the base
export const TRAVEL_PER_KM = 1; // $ per km beyond the free distance (one way), before HST
export const TRAVEL_COST_PER_KM = 0.3; // our driving cost per km, counted both ways, for margins
/** Estimated one-way driving distance from the base to a city, in whole km. */
export function roadKm(city: string) {
  const c = CITIES[city];
  if (!c) return 0;
  const rad = Math.PI / 180, dLat = (c[0] - BASE.lat) * rad, dLng = (c[1] - BASE.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(BASE.lat * rad) * Math.cos(c[0] * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * ROAD_FACTOR);
}
export const travelFee = (km: number) => Math.round(Math.max(0, km - TRAVEL_FREE_KM) * TRAVEL_PER_KM);
/** Travel cost for bookings saved before distance pricing, which only stored a zone. */
const LEGACY_ZONE_COST: Record<string, number> = { A: 12, B: 18, C: 24 };
export const HST = 0.13;
export const LABOUR = 32;
export const SUPPLY = 0.1;
/** Flat booking charge (no HST), paid when the customer books. The service charge is paid after the work. */
export const BOOKING_FEE = 25;
/** The booking charge is refunded when the customer cancels more than this many hours before the arrival window starts. */
export const REFUND_HOURS = 24;

export function by<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((x) => x.id === id);
}
const round2 = (n: number) => Math.round(n * 100) / 100;

export function quote(s: { service: ServiceId; type: TankType; size: SizeId; recur: RecurId; city: string }) {
  const svc = by(SERVICES, s.service)!;
  const type = by(TYPES, s.type)!;
  let base = svc.base[s.size];
  if (svc.typeMult) base *= type.mult;
  base = Math.round(base / 5) * 5;
  const rec = svc.id === "clean" ? by(RECUR, s.recur) : undefined;
  const discAmt = rec ? Math.round(base * rec.disc) : 0;
  const km = roadKm(s.city);
  const travel = travelFee(km);
  const subtotal = base - discAmt + travel;
  const tax = round2(subtotal * HST);
  const total = round2(subtotal + tax);
  const monthly = rec && rec.perMonth ? round2(total * rec.perMonth) : 0;
  const bookFee = BOOKING_FEE;
  const bookTax = 0; // the booking charge has no HST; HST applies to the service charge only
  const bookTotal = round2(bookFee + bookTax);
  return { svc, base, discAmt, km, travel, subtotal, tax, total, monthly, bookFee, bookTax, bookTotal, grand: round2(bookTotal + total) };
}

/** Start of the arrival window, as a timestamp. */
export function visitStart(b: Pick<Booking, "date" | "win">) {
  const d = parseIso(b.date);
  d.setHours(by(WINDOWS, b.win)?.hour ?? 9, 0, 0, 0);
  return d.getTime();
}
/** Would the booking charge be refunded if the customer cancelled at `now`? */
export const refundable = (b: Booking, now = Date.now()) => visitStart(b) - now > REFUND_HOURS * 3600e3;
/** Patch for a cancellation. When PetMe cancels or declines, the customer is always refunded. */
export function cancelPatch(b: Booking, by: "customer" | "petme", now = Date.now()): Partial<Booking> {
  return { status: "cancelled", cancelledAt: now, bookRefunded: by === "petme" || refundable(b, now) };
}
export const restorePatch: Partial<Booking> = { status: "new", cancelledAt: undefined, bookRefunded: undefined };

/** Booking charge (tax in) already paid, and the full amount for the visit. */
export const bookingPaid = (b: Booking) => b.bookTotal || 0;
export const grandTotal = (b: Booking) => round2(bookingPaid(b) + (b.total || 0));
/** What the customer has actually paid for a visit so far, after any refund. */
export function paidSoFar(b: Booking) {
  if (b.status === "done") return grandTotal(b);
  if (b.status === "cancelled") return b.bookRefunded ? 0 : bookingPaid(b);
  return bookingPaid(b);
}
/** Pre-tax revenue for a visit: service charge plus booking charge. */
export const revenue = (b: Booking) => (b.subtotal || 0) + (b.bookFee || 0);

export function econ(b: Booking) {
  const svc = by(SERVICES, b.service);
  if (!svc || !b.subtotal) return null;
  const hours = svc.hours[b.size] || 1;
  const rev = revenue(b);
  const margin = rev - hours * LABOUR - (b.km != null ? 2 * b.km * TRAVEL_COST_PER_KM : LEGACY_ZONE_COST[b.zone || "A"] || 12) - b.subtotal * SUPPLY;
  return { margin, pct: margin / rev };
}

export function tasksFor(b: Pick<Booking, "service" | "type">) {
  let t = [...(TASKS[b.service] || [])];
  if (chemOf(b.type) === "salt" && (b.service === "clean" || b.service === "setup")) t = t.concat(SALT_TASKS);
  return t;
}

/* ---------- water chemistry: [optimal lo, optimal hi, watch lo, watch hi] ---------- */
export type Metric = { id: string; label: string; unit: string; dec: number; fresh?: number[]; salt?: number[] };
export const METRICS: Metric[] = [
  { id: "temp", label: "Temp", unit: "°C", dec: 1, fresh: [24, 27, 22, 29], salt: [24.5, 26.5, 23.5, 27.5] },
  { id: "ph", label: "pH level", unit: "", dec: 2, fresh: [6.5, 7.8, 6, 8.2], salt: [8, 8.4, 7.8, 8.5] },
  { id: "sal", label: "Salinity", unit: "SG", dec: 3, salt: [1.024, 1.026, 1.022, 1.027] },
  { id: "alk", label: "Alkalinity", unit: "dKH", dec: 1, salt: [7, 11, 6, 12] },
  { id: "ca", label: "Calcium", unit: "ppm", dec: 0, salt: [400, 450, 380, 480] },
  { id: "nh3", label: "Ammonia", unit: "ppm", dec: 2, fresh: [0, 0.02, 0, 0.25], salt: [0, 0.02, 0, 0.1] },
  { id: "no2", label: "Nitrite", unit: "ppm", dec: 2, fresh: [0, 0.02, 0, 0.25], salt: [0, 0.05, 0, 0.2] },
  { id: "no3", label: "Nitrate", unit: "ppm", dec: 0, fresh: [0, 40, 0, 80], salt: [1, 15, 0, 30] },
];
export const chemOf = (type: TankType) => (by(TYPES, type) || TYPES[0]).chem;
export const metricsFor = (type: TankType) => METRICS.filter((m) => m[chemOf(type)]);
export type Level = "ok" | "warn" | "crit";
export function judge(m: Metric, v: number, type: TankType): { level: Level; label: string; range: number[] } {
  const r = m[chemOf(type)]!;
  if (v >= r[0] && v <= r[1]) return { level: "ok", label: "Optimal", range: r };
  if (v >= r[2] && v <= r[3]) return { level: "warn", label: "Watch", range: r };
  return { level: "crit", label: "Act now", range: r };
}
export const SAMPLE_READINGS: Record<"fresh" | "salt", Record<string, number>> = {
  salt: { temp: 25.6, ph: 8.21, sal: 1.025, alk: 8.6, ca: 430, nh3: 0, no2: 0, no3: 6 },
  fresh: { temp: 25.2, ph: 7.2, nh3: 0, no2: 0, no3: 22 },
};

/* ---------- livestock ---------- */
export type Critter = { name: string; kind: "fish" | "inv"; qty: number; role: string; color: string; art: string };
export const STOCK: Record<"fresh" | "salt", Critter[]> = {
  salt: [
    { name: "Ocellaris clownfish", kind: "fish", qty: 2, role: "Hosts near the rockwork", color: "#F97316", art: "clown" },
    { name: "Yellow watchman goby", kind: "fish", qty: 1, role: "Sand dweller", color: "#FACC15", art: "goby" },
    { name: "Banggai cardinalfish", kind: "fish", qty: 3, role: "Hovers mid-water", color: "#CBD5E1", art: "cardinal" },
    { name: "Skunk cleaner shrimp", kind: "inv", qty: 1, role: "Cleaner", color: "#F43F5E", art: "cleaner" },
    { name: "Turbo snails", kind: "inv", qty: 5, role: "Algae grazers", color: "#A3A380", art: "turbo" },
  ],
  fresh: [
    { name: "Neon tetra", kind: "fish", qty: 10, role: "Schooling, mid-water", color: "#38BDF8", art: "neon" },
    { name: "Panda corydoras", kind: "fish", qty: 6, role: "Bottom forager", color: "#E2E8F0", art: "panda" },
    { name: "Bristlenose pleco", kind: "fish", qty: 1, role: "Algae grazer", color: "#78716C", art: "pleco" },
    { name: "Amano shrimp", kind: "inv", qty: 4, role: "Clean-up crew", color: "#94A3B8", art: "amano" },
    { name: "Nerite snails", kind: "inv", qty: 3, role: "Glass and rock grazers", color: "#B45309", art: "nerite" },
  ],
};
export type Idea = { id: string; name: string; sci: string; minGal: number; fit: "good" | "caution"; color: string; note: string; tags: string[] };
export const IDEAS: Record<"fresh" | "salt", Idea[]> = {
  salt: [
    { id: "firefish", name: "Firefish goby", sci: "Nemateleotris magnifica", minGal: 20, fit: "good", color: "#F43F5E", note: "Peaceful hoverer that stays near a bolt hole. Safe with corals and with clownfish.", tags: ["Reef safe", "Peaceful"] },
    { id: "gramma", name: "Royal gramma", sci: "Gramma loreto", minGal: 30, fit: "good", color: "#A855F7", note: "Purple and yellow cave dweller. Hardy and calm, but keep only one per tank.", tags: ["Reef safe", "One per tank"] },
    { id: "mandarin", name: "Mandarin dragonet", sci: "Synchiropus splendidus", minGal: 30, fit: "caution", color: "#22D3EE", note: "Eats live copepods almost all day. Only for mature tanks with plenty of live rock.", tags: ["Needs mature tank", "Slow feeder"] },
    { id: "coralbeauty", name: "Coral beauty angelfish", sci: "Centropyge bispinosa", minGal: 70, fit: "caution", color: "#6366F1", note: "Bright dwarf angel. May nip some soft and LPS corals, so watch it closely.", tags: ["Reef with caution", "Semi-aggressive"] },
  ],
  fresh: [
    { id: "rasbora", name: "Harlequin rasbora", sci: "Trigonostigma heteromorpha", minGal: 10, fit: "good", color: "#FB923C", note: "Calm schooling fish. Keep in a group of eight or more for best colour.", tags: ["Peaceful", "School of 8+"] },
    { id: "gourami", name: "Honey gourami", sci: "Trichogaster chuna", minGal: 10, fit: "good", color: "#F59E0B", note: "Gentle centrepiece fish that likes floating plants and slow flow.", tags: ["Peaceful", "Plant friendly"] },
    { id: "otocinclus", name: "Otocinclus", sci: "Otocinclus spp.", minGal: 20, fit: "caution", color: "#A3A380", note: "Excellent algae eater, but delicate when new. Add only to a stable, mature tank.", tags: ["Needs mature tank", "Group of 4+"] },
    { id: "kuhli", name: "Kuhli loach", sci: "Pangio kuhlii", minGal: 20, fit: "good", color: "#EAB308", note: "Shy, eel-like bottom dweller. Needs soft sand and hiding places.", tags: ["Peaceful", "Soft sand"] },
  ],
};
export const ALL_IDEAS = [...IDEAS.salt, ...IDEAS.fresh];

/* ---------- formatting ---------- */
const pad = (n: number) => (n < 10 ? "0" : "") + n;
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => iso(new Date());
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function parseIso(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); }
export function fmtDate(s: string, withDow = true) {
  if (!s) return "";
  const d = parseIso(s);
  return (withDow ? DOW[d.getDay()] + ", " : "") + MON[d.getMonth()] + " " + d.getDate();
}
export const dayParts = (d: Date) => ({ dw: DOW[d.getDay()], dn: d.getDate(), dm: MON[d.getMonth()] });
export function fmtDur(h: number) {
  const m = Math.round(h * 60), hh = Math.floor(m / 60), mm = m % 60;
  return (hh ? hh + " h" : "") + (hh && mm ? " " : "") + (mm ? mm + " min" : "");
}
export function money(n: number) {
  const neg = n < 0;
  const s = "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg ? "−" + s : s;
}
export const money0 = (n: number) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const newRef = () => "PM-" + Math.random().toString(36).slice(2, 6).toUpperCase();
export const newId = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function dateOptions(service: ServiceId) {
  const out: { id: string; dw: string; dn: number; dm: string }[] = [];
  const d = new Date();
  if (service !== "emergency") d.setDate(d.getDate() + 1);
  for (let i = 0; out.length < 12 && i < 21; i++, d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0 && service !== "emergency") continue;
    out.push({ id: iso(d), ...dayParts(d) });
  }
  return out;
}

export function makeBooking(
  s: { service: ServiceId; type: TankType; size: SizeId; recur: RecurId; city: string; date: string; win: string; tankName?: string },
  contact: { name: string; phone: string; address?: string; notes?: string; sms?: boolean; wishlist?: string[] },
  extra: Partial<Booking> = {}
): Booking {
  const q = quote(s);
  return {
    id: newId(), ref: newRef(),
    service: s.service, type: s.type, size: s.size, tankName: s.tankName || "", city: s.city, km: q.km,
    recur: s.service === "clean" ? s.recur : "once", date: s.date, win: s.win,
    name: contact.name, phone: contact.phone, address: contact.address || "", notes: contact.notes || "", sms: !!contact.sms, wishlist: contact.wishlist || [],
    base: q.base, discAmt: q.discAmt, travel: q.travel, subtotal: q.subtotal, tax: q.tax, total: q.total, monthly: q.monthly,
    bookFee: q.bookFee, bookTax: q.bookTax, bookTotal: q.bookTotal,
    status: "new", example: false, createdAt: Date.now(),
    ...extra,
  };
}

export function exampleBookings(): Booking[] {
  const at = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
  const d0 = at(-6);
  const A = { name: "Sample customer A", phone: "416 555 0148", notes: "Clownfish pair. Dog at home." };
  const rows = [
    makeBooking({ service: "clean", type: "salt", size: "m", recur: "w2", city: "Toronto", date: iso(d0), win: "am", tankName: "Living room reef" }, A,
      { example: true, status: "done", completedAt: d0.getTime() + 2 * 3600e3, results: { temp: 25.4, ph: 8.18, sal: 1.025, alk: 8.2, ca: 425, nh3: 0, no2: 0, no3: 9 }, techNotes: "Water stable. Skimmer cup was full, cleaned it. Nitrate creeping up a little, so feed slightly less between visits." }),
    makeBooking({ service: "clean", type: "salt", size: "m", recur: "w2", city: "Toronto", date: iso(at(1)), win: "am", tankName: "Living room reef" }, A, { example: true, status: "confirmed" }),
    makeBooking({ service: "setup", type: "planted", size: "l", recur: "once", city: "Mississauga", date: iso(at(3)), win: "mid" }, { name: "Sample customer B", phone: "905 555 0172", notes: "New 120 gallon planted tank. Basement, one flight of stairs." }, { example: true }),
    makeBooking({ service: "move", type: "fresh", size: "s", recur: "once", city: "Oakville", date: iso(at(5)), win: "pm" }, { name: "Sample customer C", phone: "905 555 0119", notes: "Moving across town, 29 gallon with cichlids." }, { example: true }),
  ];
  rows.forEach((r, i) => { r.createdAt = Date.now() - (rows.length - i) * 1000; r.id = r.id + i; });
  return rows;
}
