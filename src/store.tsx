// App state: customer profile, tanks (several, one active), bookings, livestock wishlist, light/dark choice. Saved on the phone with AsyncStorage.
// Next step for a real launch: move bookings to a shared backend (e.g. Supabase) so customers and technicians see the same jobs.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, EMPTY_PROFILE, Profile, Tank, exampleBookings } from "./data";
import { Access, DEFAULT_ACCESS, ThemePref } from "./theme";

const KEY = "petme:v1";

type Store = {
  ready: boolean;
  tank: Tank; // the tank shown now
  tanks: Tank[];
  bookings: Booking[];
  wish: string[];
  profile: Profile;
  profileOpen: boolean;
  themePref: ThemePref;
  access: Access;
  toastMsg: { id: number; text: string } | null;
  setTank: (t: Tank) => void; // updates the active tank
  selectTank: (id: string) => void;
  addTank: () => Tank;
  removeTank: (id: string) => void;
  setProfile: (p: Partial<Profile>) => void;
  setProfileOpen: (open: boolean) => void;
  setThemePref: (p: ThemePref) => void;
  setAccess: (a: Partial<Access>) => void;
  addBooking: (b: Booking) => void;
  patchBooking: (id: string, p: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  toggleWish: (id: string) => boolean;
  clearWish: () => void;
  loadExamples: () => void;
  clearExamples: () => void;
  toast: (text: string) => void;
};

const Ctx = createContext<Store | null>(null);
const DEFAULT_TANK: Tank = { id: "t1", name: "Living room reef", type: "salt", size: "m", sample: true };
const newTankId = () => "t" + Date.now().toString(36);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tanks, setTanks] = useState<Tank[]>([DEFAULT_TANK]);
  const [activeId, setActiveId] = useState(DEFAULT_TANK.id);
  const tank = tanks.find((t) => t.id === activeId) || tanks[0];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themePref, setThemePref] = useState<ThemePref>("system");
  const [access, setAccessState] = useState<Access>(DEFAULT_ACCESS);
  const [toastMsg, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef<any>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw);
        if (Array.isArray(s.tanks) && s.tanks.length) {
          setTanks(s.tanks);
          setActiveId(s.activeTankId || s.tanks[0].id);
        } else if (s.tank) {
          // saved before multiple tanks: the one tank becomes the first in the list
          setTanks([{ ...s.tank, id: s.tank.id || "t1" }]);
          setActiveId(s.tank.id || "t1");
        }
        if (Array.isArray(s.bookings)) setBookings(s.bookings);
        if (Array.isArray(s.wish)) setWish(s.wish);
        if (s.profile) setProfileState({ ...EMPTY_PROFILE, ...s.profile });
        if (s.themePref === "light" || s.themePref === "dark" || s.themePref === "system") setThemePref(s.themePref);
        if (s.access) setAccessState({ ...DEFAULT_ACCESS, ...s.access });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ tanks, activeTankId: activeId, bookings, wish, profile, themePref, access })).catch(() => {});
  }, [ready, tanks, activeId, bookings, wish, profile, themePref, access]);

  const toast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo<Store>(() => ({
    ready, tank, tanks, bookings, wish, profile, profileOpen, themePref, setThemePref, access, toastMsg, toast,
    setAccess: (a) => setAccessState((prev) => ({ ...prev, ...a })),
    setTank: (t) => setTanks((prev) => prev.map((x) => (x.id === tank.id ? { ...t, id: tank.id } : x))),
    selectTank: (id) => setActiveId(id),
    addTank: () => {
      const t: Tank = { id: newTankId(), name: `Tank ${tanks.length + 1}`, type: "fresh", size: "m", sample: false };
      setTanks((prev) => [...prev, t]);
      setActiveId(t.id);
      return t;
    },
    removeTank: (id) => {
      if (tanks.length < 2) return;
      const rest = tanks.filter((t) => t.id !== id);
      setTanks(rest);
      if (id === activeId) setActiveId(rest[0].id);
    },
    setProfile: (p) => setProfileState((prev) => ({ ...prev, ...p, since: prev.since || Date.now() })),
    setProfileOpen,
    addBooking: (b) => setBookings((prev) => [b, ...prev]),
    patchBooking: (id, p) => setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...p } : b))),
    removeBooking: (id) => setBookings((prev) => prev.filter((b) => b.id !== id)),
    toggleWish: (id) => {
      const on = !wish.includes(id);
      setWish((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
      return on;
    },
    clearWish: () => setWish([]),
    loadExamples: () => setBookings((prev) => [...exampleBookings(), ...prev]),
    clearExamples: () => setBookings((prev) => prev.filter((b) => !b.example)),
  }), [ready, tank, tanks, activeId, bookings, wish, profile, profileOpen, themePref, access, toastMsg, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export const byNewest = (a: Booking, b: Booking) => (b.createdAt || 0) - (a.createdAt || 0);
