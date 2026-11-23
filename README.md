# PetMe

Mobile app for PetMe, an at-home aquarium service in Toronto and the GTA: tank setup, routine maintenance, tank moves, water chemistry and emergency visits.

Built with Expo (React Native), Reanimated animations and the "Oceanic Telemetry" design from the Stitch mockups in `reference/stitch/`.

## Try it on your phone

You need [Node.js](https://nodejs.org) (LTS) on your computer and the free **Expo Go** app on your phone ([iPhone](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

```bash
git clone <this repo>
cd petme-app
npm run setup      # installs Expo and every package at versions that match each other
npm start          # shows a QR code
```

- **iPhone:** scan the QR code with the Camera app.
- **Android:** scan it from inside Expo Go.

Your phone and computer must be on the same Wi-Fi. If they can't see each other (office or hotel Wi-Fi), run `npm run tunnel` instead.

Edits to the code reload on the phone instantly.

## What's in the app

| Tab | What it does |
| --- | --- |
| **Tanks** | Living tank hero (swimming fish, light rays, bubbles), latest water test with animated range gauges, next visit, current livestock |
| **Book** | Pick the tank, service, plan, city, day and arrival window. Live quote with HST. Shake on missing info, success sheet with haptics |
| **History** | Every visit. Tap one for the service report: checklist, chemistry, technician notes, bill |
| **Livestock** | Fish suited to the tank's type and size. Add any to discuss at the next visit |
| **Pro jobs** | Technician side: confirm requests, complete a visit by logging water readings, see revenue and margin |

Data is saved on the phone (AsyncStorage). Tap **Add example jobs** in Pro jobs to see the full flow with sample bookings.

## Project layout

```
App.tsx                  App shell: tabs, report overlay, bottom sheet, toast
src/theme.ts             Colours, fonts, spacing, spring presets
src/data.ts              Services, pricing, chemistry targets, livestock, helpers
src/store.tsx            App state + persistence
src/components/ui.tsx    Buttons, panels, segmented control, fields, badges
src/components/visuals.tsx  Tank hero, metric gauges, tab bar, bottom sheet
src/screens/             One file per tab
reference/               Stitch design system + screens, and the earlier web prototype
```

## Prices

All prices, durations and costs in `src/data.ts` are starter assumptions to test with real customers, not final rates.
