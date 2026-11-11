# EV Station Tracking

An interactive map of EV charging stations in Cambodia. Browse 104 stations, filter by plug type and opening hours, search by name, and find the closest chargers to where you are, with live tracking as you move.

## Features

- Map of every station, with teardrop pins colored by plug type: GB/T, CCS2, both, or unknown.
- Filters for plug type (GB/T, CCS2) and "Open 24 hours", plus a search by station name. Filters apply instantly in the browser.
- "Find chargers near me": a pulsing dot shows your position, follows you as you move, and the list shows the 10 closest stations sorted by distance.
- A station popup with plugs, opening hours, distance, and a "Get directions" link to Google Maps.
- A homepage with live stats and a short guide to GB/T and CCS2 plugs.
- The map is limited to Cambodia.

## Tech stack

| Part | Stack |
| --- | --- |
| `client/` | React 19, Vite, Tailwind CSS v3, react-leaflet, OpenStreetMap tiles |
| `server/` | Node.js (CommonJS), Express 5, Prisma 6, PostgreSQL (Neon) |

All tools used are free.

## Getting started

You need Node.js 18 or newer and a PostgreSQL database. The project uses a free [Neon](https://neon.tech) database, but any Postgres connection string works.

### 1. Server

```bash
cd server
cp .env.example .env        # then fill in DATABASE_URL (and PORT if you want another port)
npm install
npx prisma generate
npx prisma migrate dev      # creates the ev_stations table
npm run import:stations     # loads the 104 stations from data/stations.geojson
npm run dev                 # API on http://localhost:3000
```

Check that it works: `curl http://localhost:3000/api/ev-stations` should return 104 stations. Running the import again is safe, because it updates existing stations instead of duplicating them.

### 2. Client

```bash
cd client
cp .env.example .env        # VITE_API_BASE must match the server's address and port
npm install
npm run dev                 # open the address Vite prints
```

Keep the server running while you use the client. Without it the page loads but shows no stations.

### Scripts

| Folder | Command | What it does |
| --- | --- | --- |
| `server` | `npm run dev` | Start the API with automatic restarts |
| `server` | `npm start` | Start the API |
| `server` | `npm run import:stations` | Load or update stations from the GeoJSON file |
| `client` | `npm run dev` | Start the Vite dev server |
| `client` | `npm run build` | Build for production into `client/dist` |
| `client` | `npm run lint` | Run ESLint |

There is no automated test suite yet.

## API

The API is read-only.

| Endpoint | Returns |
| --- | --- |
| `GET /api/ev-stations` | All stations. Optional `?plug=GBT_DC` or `?plug=CCS2` filter. |
| `GET /api/ev-stations/nearby?lat=&lng=&plug=` | The 10 closest stations with `distanceKm`, nearest first. Returns 400 if `lat` or `lng` is not a number. |

Each station has an `id`, `name`, `latitude`, `longitude`, `connectors` (a list such as `["GBT_DC", "CCS2"]`), `open24h`, and `hoursText`.

## Project layout

```text
client/    React app (pages, components, hooks, utils)
server/    Express API, Prisma schema and migrations, import script, source data
```

More detail for contributors is in `client/AGENTS.md`, `server/AGENTS.md`, and `CLAUDE.md`.

## Notes

- **Location needs a secure page.** Browsers only share your location on `localhost` or HTTPS. Opening the dev site on a phone over plain `http://<your-pc-ip>` will not work. Laptops also give rough positions, while phones with GPS are accurate.
- **Station data can be out of date.** Check opening hours before you drive out.
- Map data from [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
