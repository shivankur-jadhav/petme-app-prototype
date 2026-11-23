// App state: customer profile, tank profile, bookings, livestock wishlist, light/dark choice. Saved on the phone with AsyncStorage.
// Next step for a real launch: move bookings to a shared backend (e.g. Supabase) so customers and technicians see the same jobs.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, EMPTY_PROFILE, Profile, Tank, exampleBookings } from "./data";
import { ThemePref } from "./theme";

const KEY = "petme:v1";

type Store = {
  ready: boolean;
  tank: Tank;
  bookings: Booking[];
  wish: string[];
  profile: Profile;
  profileOpen: boolean;
  themePref: ThemePref;
  toastMsg: { id: number; text: string } | null;
  setTank: (t: Tank) => void;
  setProfile: (p: Partial<Profile>) => void;
  setProfileOpen: (open: boolean) => void;
  setThemePref: (p: ThemePref) => void;
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
const DEFAULT_TANK: Tank = { name: "Living room reef", type: "salt", size: "m", sample: true };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tank, setTankState] = useState<Tank>(DEFAULT_TANK);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themePref, setThemePref] = useState<ThemePref>("system");
  const [toastMsg, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef<any>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.tank) setTankState(s.tank);
        if (Array.isArray(s.bookings)) setBookings(s.bookings);
        if (Array.isArray(s.wish)) setWish(s.wish);
        if (s.profile) setProfileState({ ...EMPTY_PROFILE, ...s.profile });
        if (s.themePref === "light" || s.themePref === "dark" || s.themePref === "system") setThemePref(s.themePref);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ tank, bookings, wish, profile, themePref })).catch(() => {});
  }, [ready, tank, bookings, wish, profile, themePref]);

  const toast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo<Store>(() => ({
    ready, tank, bookings, wish, profile, profileOpen, themePref, setThemePref, toastMsg, toast,
    setTank: (t) => setTankState(t),
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
  }), [ready, tank, bookings, wish, profile, profileOpen, themePref, toastMsg, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export const byNewest = (a: Booking, b: Booking) => (b.createdAt || 0) - (a.createdAt || 0);
