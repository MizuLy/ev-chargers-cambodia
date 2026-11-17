# Repository Guidelines (client)

React 19 + Vite + Tailwind CSS v3 + react-leaflet 5 front end for an EV charging station map of Cambodia. ES modules and JSX. It reads from the Express API in `../server`.

## Project Structure & Module Organization

- `src/main.jsx` mounts `App.jsx`, which renders `pages/Home.jsx`.
- `src/pages/Home.jsx` is the whole app shell, a single full-screen view: it owns `useStations`, `useLiveLocation` and `usePlaceName`, renders `components/layout/Navbar.jsx` (the logo only, with no site name next to it because the user asked to remove it, a "Plug guide" info button, and a chip showing the user's place or location status), and passes the data to `components/EvMap.jsx`. There is no hero, stats section, plug guide or footer any more.
- `src/components/EvMap.jsx` owns the map and all map state (plug filter, 24-hour toggle, search, live location, selected station). `FilterBar.jsx` is the search, filter chips, near-me button and legend; `StationList.jsx` is the station list (a bottom sheet on phones). `EvMap` lays them out with one CSS grid and `ResizeWatcher` tells Leaflet when the map's box changes size. `StationPopup.jsx` is the popup card shown when a pin is clicked.
- `src/hooks/useStations.js` fetches `GET {VITE_API_BASE}/api/ev-stations` once, shares the request across the app (and React StrictMode's double mount), and returns `{ stations, error }`.
- `src/utils/stations.js` holds the plug filters, `plugLabel`, `plugName`, `plugColor`, `markerColor`, and `distanceKm` (haversine).
- `public/` holds the brand logo `ppi-logo.png` (the People & Partners Insurance PLC wordmark, trimmed of its empty margin, used in the navbar), plus `ppi-icon.png` (64 px tab icon) and `ppi-apple-touch-icon.png` (180 px, white background), both cut from the logo's handshake emblem and linked from `index.html`. The files got new names on purpose so browsers don't keep showing the old cached tab icon. `src/assets/images/elephant-calf.png` is an older generated character image that is no longer used. `favicon.svg` and `icons.svg` are unused Vite template leftovers.
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
- Pins are teardrop `L.divIcon`s with a lightning bolt, colored by plug type: GB/T `#3DA398` (the primary color), CCS2 `#E08A12`, both `#5B4FD6`, unknown `#8A948F`. Icons are cached per color and size in `pinIcon`; keep them cached. `StationMarker` is `memo`-ized with stable props; keep it that way so typing in search does not re-render every pin.
- Tiles are `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution. Do not switch to CARTO tiles: they now require an API key and show "API KEY REQUIRED".
- The map is locked to Cambodia (`CAMBODIA_BOUNDS`, `minZoom={7}`, `maxBoundsViscosity={1}`, `noWrap`). Keep that unless asked otherwise.
- The user's position is tracked from page load, with no click: `hooks/useLiveLocation.js` runs `navigator.geolocation.watchPosition` and returns `{ pos, accuracy, status, retry }` (`status` is `locating`, `tracking`, `denied` or `unavailable`). A pulsing blue dot plus an accuracy circle follows the user. The map flies to the first fix once (skipped if a station was already picked or the user is outside Cambodia) and afterwards pans only if the dot leaves the view.
- "Find chargers near me" does not start tracking. It only switches the list to the 10 closest stations (the anchor refreshes after about 200 m of movement); "Show all" switches back and keeps the dot. The panel's `LocationLine` shows the status, including a "Try again" action when location is blocked or unavailable.
- `hooks/usePlaceName.js` turns the position into "Phnom Penh, Cambodia" with OpenStreetMap's free Nominatim reverse geocoding. Only coordinates rounded to 0.01 degrees (about 1 km) are sent, and results are cached, to respect Nominatim's limit of 1 request per second and to avoid sending the exact position. It shows the province, not the district, because the rounded point can land in a neighboring district. Do not switch to a keyed geocoder without asking.
- Geolocation only works on `localhost` or HTTPS, and desktop browsers give rough positions.
- Fly the map through the `flyTarget` state, never by passing a fresh array on each render (that re-flies on every render).

## Design Rules

- **Never use white text.** The user asked for this explicitly. Use dark `text-ink`, with light tints such as `#D5EFE6` for active and primary states (green outline, dark text). White is fine for backgrounds, borders and marker outlines, not for text.
- Tokens live in `tailwind.config.js`: `paper #F6F7F3`, `ink #17231F`, `muted #5E6B66`, `line #E2E6DF`, `primary #3DA398` (the brand color the user chose; dark ink text on it is readable, so filled primary buttons and active chips use `text-ink`), `primaryDark #247A70` (teal text on white, where `primary` is too light), `primaryTint #DDF1EE` (selected row background), `amber #E08A12`, `violet #5B4FD6`. Keep the 5 unused font aliases untouched.
- Font: Instrument Sans with Noto Sans Khmer as fallback, loaded by `<link>` tags in `index.html`. Do not add an `@import` for fonts or load more families than are used.
- Use icons, not plain colored dots, as indicators. Icons come from Lucide through `react-icons/lu` (`LuZap`, `LuClock`, `LuLocateFixed`, `LuChevronUp`, `LuChevronDown`). `components/ui/PlugBadge.jsx` is a colored circle with a lightning bolt (same look as the map pins) used in the station list, legend and popup. The pulsing blue dot on the map stays a dot. The user asked to remove the fuel icon that used to sit next to the site name in the navbar; do not bring it back.
- The "Plug guide" button in the navbar (info icon) opens `components/InfoDialog.jsx`, a native `<dialog>` (Escape, backdrop click and the close button all close it) explaining GB/T, CCS2 and the pin colors, with plug drawings and brand logos. Which plug a car has depends on the market it was built for, and no reliable brand or model table for Cambodia was found, so the text names brands only as examples and says so; do not turn it into a per-model compatibility table without a trustworthy source.
- The two plug pictures in the guide are buttons that open an enlarged view in a second `<dialog>` nested inside the guide dialog (Escape or a backdrop click closes just the picture). React passes a nested dialog's `close` event up to the outer dialog's `onClose`, so the outer handler checks `e.target === ref.current`; keep that guard. When testing in headless Chrome, open dialogs with real mouse events (`Input.dispatchMouseEvent`), because dialogs opened by a scripted `element.click()` are treated as one group and a single Escape closes all of them, which looks like a bug but is not.
- Guide images live in `public/guide/`. `plugs/` holds the two EVESCO infographics the site owner supplied (`gbt-ac-connector-1024x1024.png` and `CCS-2-DC-EV-charging-connector-socket-and-plug-EVESCO-1024x1024.png`). The GB/T one shows the **AC** plug, not the DC fast-charging plug, so its caption in `InfoDialog.jsx` says so; keep that caption unless the picture is replaced. Their license is unknown, so the dialog credits EVESCO. `brands/*.svg` are public-domain logos from Wikimedia Commons whose names are still trademarks of their owners; the dialog says they are shown only to identify cars. Wikimedia rate-limits downloads (HTTP 429 with a `retry-after` header), so fetch slowly and respect it.
- Leaflet's global link color overrides plain classes inside popups; use `!text-ink` (important) on links there.
- Layout is full screen (`h-dvh`, no page scrolling): a 56 px navbar on top, then the map with the filters. On desktop the filters and list form a left column at 36% of the width (`clamp(340px, 36%, 520px)`). On phones the filters are a compact bar at the top (search plus a "Near me" button, and a sideways-scrolling row of chips), the map fills the middle, and the station list is a bottom sheet that opens to about 46% of the screen height; picking a station or closing it collapses the sheet, and "Near me" opens it. The legend is desktop only. The navbar has no site name, so the logo, location chip and info button fit on phones. The user found the old phone layout (map on top, a small filter panel below) hard to scroll, so keep the list's scroll area large on phones. Check phone width (390 px) when changing layout.

## Coding Style & Naming Conventions

Two-space indentation, double quotes, semicolons, function components, PascalCase component files, camelCase hooks and utils (`useStations`). Keep components small and code short; do not add features that were not requested. `react-hooks` lint forbids calling `setState` synchronously inside an effect, so update state from event handlers or async callbacks.

## Commit & Pull Request Guidelines

Short imperative messages such as `Add live location tracking`, one focused change per commit. Pull requests should explain the user-visible change, list verification commands (`npm run lint`, `npm run build`), and include screenshots for UI changes. Never include `.env` values.
