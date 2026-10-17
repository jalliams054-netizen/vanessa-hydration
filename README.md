# Vanessa's Hydration

A water tracker that behaves like a small game. Every sip fills a glass wave, grows a virtual plant, and extends a streak — and if the plant is neglected, it lets her know exactly how it feels about that.

Built as a personal gift, so the copy is specific to one person. Everything else is a standard, offline-first React PWA.

**Live app:** <https://jalliams054-netizen.github.io/vanessa-hydration/>

## Features

### Water tracking
- Log 250 ml, 500 ml, or a 150 ml quick sip; individual entries are kept per day.
- Adjustable daily target between 1000 ml and 4000 ml in 50 ml steps, with presets. The target is stored locally and every derived figure — progress, remaining, streak, plant health — recalculates from it immediately.
- Lowering the target can rescue a day that already looked lost, and the streak engine treats each day against the target that applies now.

### The plant
- Five growth levels; three goal-met days push it up one level.
- Health tracks today's progress against the target, so the leaves get greener through the day.
- Misses a goal the day after a successful run and it droops, with its own stage copy for every level.

### Streaks and milestones
- Current streak, best streak, and four unlockable rewards at 3, 7, 14 and 30 consecutive goal days.
- A streak survives today being unfinished as long as yesterday counted, and is flagged as at risk.

### Sassy notifications
- Fifteen hand-written reminders, all addressed to Vanessa, never repeating the previous one.
- Quiet outside 09:00–21:00, capped at four per day, at least 45 minutes apart, and silent once the target is met.
- Notifications carry a "+250 ml" action; the manifest also exposes 250 ml, 500 ml and 150 ml as app-icon shortcuts for long-press on the home-screen icon.

### Look and feel
- Background, gradients and accent colours shift between morning, afternoon and night palettes based on local time.
- Glassmorphism cards over an animated sky, an SVG wave that fills with progress, Framer Motion transitions, a canvas droplet burst when the target is hit, and Web Vibration haptics on taps.
- Fixed bottom tab bar (Home / Plant / Settings) with a shared-element highlight, so it reads as a native app rather than a scrolling page.

### Offline first
- A service worker precaches the whole shell, so the app loads with no connection.
- All state lives in `localStorage`. There is no account, no backend, and no analytics.

## Add it to the home screen

**Android (Chrome)** — open the link, tap the **⋮** menu, then **Add to Home screen**. Long-press the new icon afterwards to reach the quick-log shortcuts.

**iPhone / iPad (Safari)** — open the link, tap the **Share** button, then **Add to Home Screen**. Notifications and the app-icon shortcuts only work from that installed icon, and need iOS 16.4 or later.

**Desktop (Chrome / Edge)** — click the install icon at the right end of the address bar.

## Tech stack

React 18, Vite 5, `vite-plugin-pwa` with a custom Workbox (injectManifest) service worker, Tailwind CSS 3, Framer Motion 11, lucide-react icons. No UI framework and no runtime dependencies beyond React.

## Repository layout

```
src/
  components/    presentational pieces (WaterWave, VirtualPlant, BottomNav, ...)
  views/         HomeView, PlantView, SettingsView — one per tab
  hooks/         useHydration, useReminders, useGoalCelebration, ...
  lib/hydration.js   all the counting: streaks, plant levels, goal clamping
  styles/theme.js    the three time-of-day palettes
  sw.js              service worker: precaching, font caching, notification clicks
scripts/         node-based checks that run without a browser
```

The rule worth knowing before editing: state transitions live in `src/lib/hydration.js` as pure functions (`withEntry`, `withGoal`, `deriveMetrics`) so they can be unit-tested; hooks only wire them to React and `localStorage`.

## Development

Requires Node 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173/vanessa-hydration/
npm run check      # 71 assertions over the hydration, notification and deep-link logic
npm run build      # production bundle in dist/
npm run preview    # serve the built app, service worker included
```

The dev server, the build and the deployed site all use the `/vanessa-hydration/` base path, so behaviour matches production locally. Note that a service worker sticks around between runs — if a change does not appear, unregister it via DevTools → Application → Service Workers rather than hard-reloading, since a reload bypasses the worker.

## Deployment

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which installs dependencies, runs the checks, builds, and publishes `dist/` to GitHub Pages.

One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. Without it the deploy job fails with a permissions error.

## Data and privacy

Intake logs, streak history, plant level, the chosen target and notification state are stored only in the browser's `localStorage` on the device. Nothing is sent anywhere, and clearing site data resets the garden — worth knowing before testing, since the streak cannot be recovered.

## Known limitations

- Reminders are scheduled by the app itself, so they only fire while a tab or installed window is open. Reliable background nagging would need Web Push with a server, or Periodic Background Sync (Chromium-only).
- Haptics rely on the Web Vibration API, which iOS does not implement; the rest of the app is unaffected.
- Notification permission is granted per origin, so the home-screen install and the browser tab each need their own.
