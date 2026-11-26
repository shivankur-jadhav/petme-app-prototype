# PetMe — notes for Claude Code

## What this is
PetMe is an at-home aquarium service business in Toronto/GTA. This Expo React Native app is the customer + technician prototype the owner tests on their phone with Expo Go. First focus is fish tank services only (setup, maintenance, moves, chemistry, emergencies). Other pet services from the original pitch (pet taxi, grooming, live animal delivery) are deliberately out of scope for now.

## Commands
- `npm run setup` — first install (installs Expo-matched versions of every dependency)
- `npm start` / `npm run tunnel` — dev server, scan QR with Expo Go
- `npm run typecheck` — TypeScript check
- After adding any Expo or React Native package, use `npx expo install <pkg>`, never plain `npm install`, so versions match the SDK.

## Browser test link (artifact) — update it after every change
The owner tests in the browser at https://claude.ai/artifact/EYEiToAXDcHxjfgnFFbnXH (shared with anyone who has the link; viewers get updates live). After every change that is committed:
1. `npm run typecheck`
2. `node scripts/build-artifact.mjs <scratch folder>` (offline: prefix `EXPO_OFFLINE=1`). Keep the same scratch folder between builds so `files.json` removes the previous code file.
3. Publish with the Artifact tool: `file_path` `<scratch>/petme.html`, `root` `<scratch>/site`, `files` from `<scratch>/files.json`, and `url` set to the link above (from a new session, read the artifact first). Never pass `icon` or `capabilities` on these updates.
4. Tell the owner it is live and what to try. No `git pull` is needed for the browser link.
Web differences: no haptics; the camera opens through the phone's own camera app (file input), and saved media lives in the browser (`src/webMedia.ts`).

## Stack
Expo (managed, latest SDK, must keep working in Expo Go — no custom native modules), TypeScript (non-strict), react-native-reanimated for all motion, react-native-svg for icons and art, expo-linear-gradient, expo-blur, expo-haptics, AsyncStorage. No navigation library: `App.tsx` switches tabs and overlays the service report.

## Design system (follow it)
Source: `reference/stitch/DESIGN.md` and the four screen PNGs next to it. Tokens live in `src/theme.ts`; use them, never raw hex in screens.
- Light and dark themes, chosen in Profile → Appearance (System / Light / Dark, System is the default). Dark is the Stitch original: abyss background `#061426`, glass panels (`C.glass` + 1px `C.line` border, 8px radius), electric cyan `C.primary` for active state and primary buttons, `C.tertiary` blue for secondary data. Light (`LIGHT` in `theme.ts`) uses the same token names with a lagoon-white canvas, white glass panels and a deeper cyan for contrast.
- Theming rules: `C` and `T` always hold the active palette (`applyTheme` in `theme.ts`, called from `App.tsx`). Read colours from `C` at render time; module-level styles must use `themed(() => StyleSheet.create({...}))` so they rebuild after a switch. Never capture a colour in a module-level constant. The tank (`TankView`) stays dark in both themes.
- Logo: the orca in `assets/logo.png` is a white mask; show it with `tintColor` (header uses `C.logo`: white in dark mode, black in light mode). App icon, Android adaptive icon and splash are generated from the same artwork.
- Status colours (dark / light): ok `#10B981` / `#059669`, warn `#F59E0B` / `#B45309`, crit `#F43F5E` / `#E11D48`. Status always shows as a badge with a dot (pulsing when it needs attention).
- Type: Space Grotesk for headings and big numbers, Inter for body (Geist in the Stitch file; swap via `@expo-google-fonts/geist` if wanted), monospace for references and money ledgers. Uppercase 10px labels with letter spacing.
- Copy: plain, short, user-side wording. No "telemetry" jargon in UI text.

## Motion conventions
- Springs come from `SPRING` / `SPRING_SOFT` in `theme.ts` so everything feels like one system.
- Screen content enters with `enter(i)` (staggered FadeInDown spring); size changes use `layout` (LinearTransition spring).
- Every pressable uses `Press` (scale to ~0.97 + light haptic). Primary actions use soft impact; success/error use notification haptics.
- Selected states animate (sliding segmented pill, ZoomIn check marks). Numbers that change re-enter via a `key` change.
- Keep animations on the UI thread (Reanimated shared values), and keep loops cheap.

## Accessibility (motor)
For people with limited hand movement, tremors or limited reach. Keep these when adding screens:
- Every `Press` has an invisible touch margin (`hitSlop`), and buttons are at least 48pt tall (36pt for small ones, plus the margin).
- Profile → Accessibility: "Larger buttons and touch areas" (`A.big`) makes buttons, chips, checkboxes, segmented controls, tabs and the avatar physically bigger; "Ask me to tap twice before cancelling or removing anything" (`A.confirm`, on by default). Settings live in `access` in the store and are applied like the theme (`applyAccess` in `theme.ts`); read `A.big` inside `themed()` styles so they rebuild.
- Anything that cancels, declines or removes uses `<Btn confirm="Tap again to …">`: the first tap only arms it (resets after 4 seconds).
- Never make a gesture the only way to do something: the fish viewer has + / − zoom buttons and a close button alongside pinch, double-tap and swipe.
- Give icon-only buttons an `accessibilityLabel` (Voice Control and screen readers use it). Motion follows the phone's Reduce Motion setting through Reanimated's default (`ReduceMotion.System`).

## Tank video
The top of the Tanks screen is `TankView` (`src/components/TankView.tsx`): a drawn aquarium (hood with light bar, glass reflections, base trim) that loops the customer's real tank video, muted, with expo-video. A photo shows with a slow drift. Over a video or photo, and in the empty tank, `WaterLife` keeps the tank alive: a rippling surface, two light bands drifting at different speeds, the hood light breathing, three bubbles rising up the glass and five floating specks (keep it to that budget; no drawn fish). Small tank pictures in lists (the "Your tanks" row, Book) use `TankThumb`: the tank's photo, a tiny muted loop of its video, or the tank icon. With neither, the empty tank says "Film your tank" with Record a video / choose from my phone right inside the glass. There are no drawn fish: the fish you see at the top of the Tanks screen are always the customer's real tank.
- Customers add one from the empty tank itself or from Tanks → "Tank video" (record with the camera or choose from the phone). Technicians can attach one in Pro → "Complete with report"; it is saved on the booking (`Booking.media`) and shows in that visit's report.
- The tank shows the newest of the customer's own video (`Tank.media`) and any technician video from a finished visit (`latestTankMedia` in `src/media.ts`).
- Files are copied into the app's document folder (`tank-media/`) with expo-file-system so they survive cache clearing; `forgetMedia` deletes replaced copies.
- "Record a video" opens the rear camera in video mode (`cameraType: back`, videos only). On the web (browser / artifact) the camera opens through a file input with `capture`, and picked files are kept in the browser's IndexedDB (`src/webMedia.ts`, uri `idb:<key>`, shown via `useMediaUri`) so they survive a reload; show saved media through `useMediaUri` everywhere.
- Until there is a shared backend, a technician's video only exists on the phone that recorded it. With the backend, upload to storage and save the URL in `media.uri`.

## Species photos
Current livestock and the Livestock tab suggestions show real photos (`SpeciesThumb` in `src/components/SpeciesThumb.tsx`). Every species in the app has two bundled photos: `assets/species/<art>.jpg` (360 x 360 crop for tiles) and `assets/species-large/<art>.jpg` (the whole photo up to 1200px, for the full-screen viewer), both with light levels and sharpening, listed in `src/speciesPhotos.ts` with photographer, licence and a link to the original on iNaturalist, so photos show instantly and offline. Only licences that allow commercial use are allowed (CC0, CC BY, CC BY-SA; never NC or ND). A species without a bundled photo falls back to a Wikipedia lookup (`src/speciesPhoto.ts`, using each `Critter`/`Idea` `wiki` titles), then to the drawn `CritterArt`. Customers can replace a stock photo with a photo of their own fish (camera button on each Current livestock row, saved in `Tank.fishPhotos` by species name). Fish named on a booking (the "to discuss" wishlist on Book, the visit report and Pro jobs) show as `FishChips` with a small round photo. Credits are listed under each section ("Photos from iNaturalist · Credits"); keep them visible wherever these photos appear, because CC BY and CC BY-SA require the credit.

## Fish viewer
Tapping a fish photo (Current livestock rows, Livestock tab cards, fish chips on bookings) opens `FishViewer` (`src/components/FishViewer.tsx`, provider wraps the shell in `App.tsx`; open it with `useFishViewer()`, or pass `zoom` to `SpeciesThumb`). Full-screen photo with pinch, double-tap and drag to zoom (PanResponder + Reanimated, no extra native package), swipe down or × to close. It shows the bundled large photo (`SPECIES_PHOTOS[art].large`) at once, offline and in the browser link; `src/zoomPhoto.ts` downloads a large version only for a species without one. Below the photo: name, scientific name, care level, adult size, origin and a plain description from `src/speciesInfo.ts` (keyed by `art`; every species needs an entry), plus the photo credit.

## Data model
Customers can have several tanks: `tanks` + the active `tank` in the store (`selectTank`, `addTank`, `removeTank`; `setTank` updates the active one). The Tanks screen opens with a "Your tanks" row (tap to switch, "Add tank"); everything on Tanks, Livestock and Book follows the active tank. Bookings carry `tankId` (older ones match by `tankName`, see `forTank`). Water type and size are changed only in Tanks → Edit tank, never from Book.
`Booking` in `src/data.ts` is the core record: service, tank type/size, city + estimated km from the base, date + window, contact, price breakdown, status (`new → confirmed → done`, or `cancelled`), and on completion `results` (water readings) + `techNotes`. Pricing is `quote()`; margins are `econ()`. Travel is charged by distance from the base at Bramalea City Centre (`BASE`, `roadKm()`, `travelFee()` in `data.ts`) and is folded into the service price, never shown as its own line. All numbers are starter assumptions.

## Known gaps / roadmap
1. Shared backend (Supabase suggested: Postgres + auth + realtime) so customers and technicians see the same bookings; split technician screens behind a role.
2. Phone-number sign-in (OTP), multiple saved addresses. (One profile with one address is saved on the phone today: `Profile` in `src/data.ts`, opened from the header avatar.)
3. Payments after the visit (Stripe), plan billing.
4. Push notifications: booking confirmed, tech 15 minutes away, report ready.
5. Real livestock records per tank, editable by the technician.
6. Splash screen in light mode (the splash is always abyss blue; it shows before the theme is known).

## Checking work
Run `npm run typecheck`, then open in Expo Go on a real phone: every tab, booking flow (including the validation shake), example jobs in Pro, completing a job with readings, and the report it produces.
