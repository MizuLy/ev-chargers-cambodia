# Repository Guidelines (client)

React 19 + Vite + Tailwind CSS v3 + react-leaflet 5 front end for an EV charging station map of Cambodia. ES modules and JSX. It reads from the Express API in `../server`.

## Project Structure & Module Organization

- `src/main.jsx` mounts `App.jsx`, which renders `pages/Home.jsx`.
- `src/pages/Home.jsx` is the homepage: header, hero, stats (computed from the station list), the map card, a GB/T vs CCS2 plug guide, and a footer.
- `src/components/EvMap.jsx` owns the map and all map state (plug filter, 24-hour toggle, search, live location, selected station). `StationPanel.jsx` is the side panel (search, filter chips, near-me button, legend, station list). `StationPopup.jsx` is the popup card shown when a pin is clicked.
- `src/hooks/useStations.js` fetches `GET {VITE_API_BASE}/api/ev-stations` once, shares the request across the app (and React StrictMode's double mount), and returns `{ stations, error }`.
- `src/utils/stations.js` holds the plug filters, `plugLabel`, `plugName`, `plugColor`, `markerColor`, and `distanceKm` (haversine).
- `public/` holds `favicon.png` (64 px) and `apple-touch-icon.png` (180 px) made from `src/assets/images/elephant-calf.png`, the site's character image. `favicon.svg` and `icons.svg` are unused Vite template leftovers.
- `components/ProtectedRoute.jsx` is an empty placeholder; there is no routing or auth. `README.md` is the stale starter template text.

## Build, Test, and Development Commands

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build to dist/
npm run lint      # ESLint (react-hooks and react-refresh rules)
npm run preview
```

There is no test runner. Validate a change with `npm run lint` and `npm run build`, and check the UI in a browser. Headless Chrome driven over the DevTools protocol works for screenshots and DOM checks. The API must be running, or the map shows no pins and the panel says "Could not load stations".

## Environment

`VITE_API_BASE` in `.env` (see `.env.example`) must point at the running server, for example `http://localhost:6969`. `.env` is gitignored; do not commit or print it.

## Map & Data Rules

- Fetch the station list once. Filtering (plug, 24 hours, search) and "closest to me" (10 nearest, sorted by `distanceKm`) happen in the browser in `EvMap.jsx`, so filter clicks need no network call. Do not reintroduce a fetch per filter change. The server's `/nearby` endpoint exists but is unused.
- Pins are teardrop `L.divIcon`s with a lightning bolt, colored by plug type: GB/T `#0E7C66`, CCS2 `#E08A12`, both `#5B4FD6`, unknown `#8A948F`. Icons are cached per color and size in `pinIcon`; keep them cached. `StationMarker` is `memo`-ized with stable props; keep it that way so typing in search does not re-render every pin.
- Tiles are `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution. Do not switch to CARTO tiles: they now require an API key and show "API KEY REQUIRED".
- The map is locked to Cambodia (`CAMBODIA_BOUNDS`, `minZoom={7}`, `maxBoundsViscosity={1}`, `noWrap`). Keep that unless asked otherwise.
- "Find chargers near me" starts `navigator.geolocation.watchPosition`: a pulsing blue dot plus an accuracy circle follows the user, the nearby anchor refreshes after about 200 m of movement, and the map pans only if the dot leaves the view. "Show all" stops tracking. Geolocation only works on `localhost` or HTTPS, and desktop browsers give rough positions.
- Fly the map through the `flyTarget` state, never by passing a fresh array on each render (that re-flies on every render).

## Design Rules

- **Never use white text.** The user asked for this explicitly. Use dark `text-ink`, with light tints such as `#D5EFE6` for active and primary states (green outline, dark text). White is fine for backgrounds, borders and marker outlines, not for text.
- Tokens live in `tailwind.config.js`: `paper #F6F7F3`, `ink #17231F`, `muted #5E6B66`, `line #E2E6DF`, `lagoon #0E7C66`, `amber #E08A12`, `violet #5B4FD6`. Keep the 5 unused font aliases untouched.
- Font: Instrument Sans with Noto Sans Khmer as fallback, loaded by `<link>` tags in `index.html`. Do not add an `@import` for fonts or load more families than are used.
- Leaflet's global link color overrides plain classes inside popups; use `!text-ink` (important) on links there.
- Layout is one contained card, not full screen: the panel sits left of the map on desktop and under the map on phones (map `h-[360px]`, panel `h-[440px]`). Check phone width (390 px) when changing layout.

## Coding Style & Naming Conventions

Two-space indentation, double quotes, semicolons, function components, PascalCase component files, camelCase hooks and utils (`useStations`). Keep components small and code short; do not add features that were not requested. `react-hooks` lint forbids calling `setState` synchronously inside an effect, so update state from event handlers or async callbacks.

## Commit & Pull Request Guidelines

Short imperative messages such as `Add live location tracking`, one focused change per commit. Pull requests should explain the user-visible change, list verification commands (`npm run lint`, `npm run build`), and include screenshots for UI changes. Never include `.env` values.
