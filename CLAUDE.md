# PetMe — notes for Claude Code

## What this is
PetMe is an at-home aquarium service business in Toronto/GTA. This Expo React Native app is the customer + technician prototype the owner tests on their phone with Expo Go. First focus is fish tank services only (setup, maintenance, moves, chemistry, emergencies). Other pet services from the original pitch (pet taxi, grooming, live animal delivery) are deliberately out of scope for now.

## Commands
- `npm run setup` — first install (installs Expo-matched versions of every dependency)
- `npm start` / `npm run tunnel` — dev server, scan QR with Expo Go
- `npm run typecheck` — TypeScript check
- After adding any Expo or React Native package, use `npx expo install <pkg>`, never plain `npm install`, so versions match the SDK.

## Stack
Expo (managed, latest SDK, must keep working in Expo Go — no custom native modules), TypeScript (non-strict), react-native-reanimated for all motion, react-native-svg for icons and art, expo-linear-gradient, expo-blur, expo-haptics, AsyncStorage. No navigation library: `App.tsx` switches tabs and overlays the service report.

## Design system (follow it)
Source: `reference/stitch/DESIGN.md` and the four screen PNGs next to it. Tokens live in `src/theme.ts`; use them, never raw hex in screens.
- Light and dark themes, chosen in Profile → Appearance (System / Light / Dark, System is the default). Dark is the Stitch original: abyss background `#061426`, glass panels (`C.glass` + 1px `C.line` border, 8px radius), electric cyan `C.primary` for active state and primary buttons, `C.tertiary` blue for secondary data. Light (`LIGHT` in `theme.ts`) uses the same token names with a lagoon-white canvas, white glass panels and a deeper cyan for contrast.
- Theming rules: `C` and `T` always hold the active palette (`applyTheme` in `theme.ts`, called from `App.tsx`). Read colours from `C` at render time; module-level styles must use `themed(() => StyleSheet.create({...}))` so they rebuild after a switch. Never capture a colour in a module-level constant. The tank hero is underwater art and stays dark in both themes.
- Logo: the orca in `assets/logo.png` is a white mask; show it with `tintColor` (header uses `C.logo`: white in dark mode, black in light mode). App icon, Android adaptive icon and splash are generated from the same artwork.
- Status colours (dark / light): ok `#10B981` / `#059669`, warn `#F59E0B` / `#B45309`, crit `#F43F5E` / `#E11D48`. Status always shows as a badge with a dot (pulsing when it needs attention).
- Type: Space Grotesk for headings and big numbers, Inter for body (Geist in the Stitch file; swap via `@expo-google-fonts/geist` if wanted), monospace for references and money ledgers. Uppercase 10px labels with letter spacing.
- Copy: plain, short, user-side wording. No "telemetry" jargon in UI text.

## Motion conventions
- Springs come from `SPRING` / `SPRING_SOFT` in `theme.ts` so everything feels like one system.
- Screen content enters with `enter(i)` (staggered FadeInDown spring); size changes use `layout` (LinearTransition spring).
- Every pressable uses `Press` (scale to ~0.97 + light haptic). Primary actions use soft impact; success/error use notification haptics.
- Selected states animate (sliding segmented pill, ZoomIn check marks). Numbers that change re-enter via a `key` change.
- Keep animations on the UI thread (Reanimated shared values), and keep loops cheap (`TankScene` swims at most 4 fish + 3 bubbles; resting species such as gobies, plecos, shrimp and snails are placed still).

## Tank video
The top of the Tanks screen is `TankView` (`src/components/TankView.tsx`): a drawn aquarium (hood with light bar, glass reflections, base trim) that loops the customer's real tank video, muted, with expo-video. A photo shows with a slow drift; with neither, `TankScene` (`src/components/TankScene.tsx`) stands in: an illustration of the customer's own tank (reef, freshwater or planted scenery, fish scaled to the tank size) with their livestock drawn by `CritterArt`, each species placed where it lives (`PLACES`).
- Customers add one from Tanks → "Tank video" (record with the camera or choose from the phone). Technicians can attach one in Pro → "Complete with report"; it is saved on the booking (`Booking.media`) and shows in that visit's report.
- The tank shows the newest of the customer's own video (`Tank.media`) and any technician video from a finished visit (`latestTankMedia` in `src/media.ts`).
- Files are copied into the app's document folder (`tank-media/`) with expo-file-system so they survive cache clearing; `forgetMedia` deletes replaced copies.
- Until there is a shared backend, a technician's video only exists on the phone that recorded it. With the backend, upload to storage and save the URL in `media.uri`.

## Species photos
Current livestock shows real photos (`SpeciesThumb` in `src/components/SpeciesThumb.tsx`). Each `Critter` has `wiki`: Wikipedia page titles to try in order. On the phone, `src/speciesPhoto.ts` reads the page's lead image, keeps it only if it is a JPEG photo hosted on Wikimedia Commons (so freely licensed), fetches a 320px thumbnail with photographer and licence, and caches the result in AsyncStorage. The drawn `CritterArt` shows while loading, offline, or when no photo exists. The Livestock tab suggestions use the same photos (`Idea.wiki`). Customers can replace a stock photo with a photo of their own fish (camera button on each Current livestock row, saved in `Tank.fishPhotos` by species name). Credits are listed under each section ("Photos from Wikimedia Commons · Credits"); keep them visible wherever these photos appear, because the licences require it.

## Data model
`Booking` in `src/data.ts` is the core record: service, tank type/size, city + estimated km from the base, date + window, contact, price breakdown, status (`new → confirmed → done`, or `cancelled`), and on completion `results` (water readings) + `techNotes`. Pricing is `quote()`; margins are `econ()`. Travel is charged by distance from the base at Bramalea City Centre (`BASE`, `roadKm()`, `travelFee()` in `data.ts`) and is folded into the service price, never shown as its own line. All numbers are starter assumptions.

## Known gaps / roadmap
1. Shared backend (Supabase suggested: Postgres + auth + realtime) so customers and technicians see the same bookings; split technician screens behind a role.
2. Phone-number sign-in (OTP), multiple saved addresses, multiple tanks per customer. (One profile with one address is saved on the phone today: `Profile` in `src/data.ts`, opened from the header avatar.)
3. Payments after the visit (Stripe), plan billing.
4. Push notifications: booking confirmed, tech 15 minutes away, report ready.
5. Real livestock records per tank, editable by the technician.
6. Splash screen in light mode (the splash is always abyss blue; it shows before the theme is known).

## Checking work
Run `npm run typecheck`, then open in Expo Go on a real phone: every tab, booking flow (including the validation shake), example jobs in Pro, completing a job with readings, and the report it produces.
