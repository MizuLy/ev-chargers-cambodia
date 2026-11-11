# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An EV charging station map for Cambodia: 104 stations, filterable by plug type and hours, with live "near me" tracking. It is two independent npm projects with no root `package.json` and no git repository:

- `server/` — read-only Express 5 + Prisma 6 JSON API on Neon Postgres (CommonJS).
- `client/` — React 19 + Vite + Tailwind v3 + react-leaflet front end (ES modules).

Each folder has its own `AGENTS.md` with detailed conventions, gotchas and design rules. Read the one for the folder you are working in before changing it.

## Commands

Run each from its own folder. Both processes must be running for the map to show pins.

```bash
# server/
npm install && npx prisma generate
npm run dev                    # nodemon src/server.js
npx prisma migrate dev         # needs DATABASE_URL in server/.env
npm run import:stations        # upsert the 104 stations from data/stations.geojson

# client/
npm install
npm run dev                    # Vite dev server
npm run lint
npm run build
```

There is no test runner in either project (`server`'s `npm test` is a placeholder that fails). Validate the server with `curl` against `/api/ev-stations` (expect 104 stations) and the client with `npm run lint` plus `npm run build` and a look in the browser.

## Architecture

Data flows one way:

1. `server/data/stations.geojson` is the source of truth. `server/scripts/import-stations.js` upserts it into the single `ev_stations` table (`connectors` is a `String[]`, there is no connector table). Duplicate stations at the same coordinates are intentional. The importer maps `GB-T` to `GBT_DC` and drops `Unknown` and `CCS/SAE`, leaving an empty array.
2. The API (`server/src`) mounts everything through `routes.js` at `/api`. Features live in `src/modules/<feature>/` as route, controller and service, and the shared Prisma client is `src/libs/prisma.js`. Endpoints: `GET /api/ev-stations?plug=` and `GET /api/ev-stations/nearby?lat&lng&plug`.
3. The client fetches the full list once (`client/src/hooks/useStations.js`, a shared request). `pages/Home.jsx` computes the stat numbers from it and passes it to `components/EvMap.jsx`, which owns all map state and does the filtering and the 10-closest sort in the browser. The server's `/nearby` endpoint is not called by the client.

Two things span both projects: `client/.env`'s `VITE_API_BASE` must match the port in `server/.env` (currently 6969; the server falls back to 3000 if `PORT` is unset), and the connector values used for filtering (`GBT_DC`, `CCS2`) must stay identical in the importer, the API and `client/src/utils/stations.js`.

## Non-obvious rules

- **No white text anywhere in the UI.** The user asked for this explicitly. Use dark text on light tints.
- **Use OpenStreetMap tiles, not CARTO.** CARTO now returns "API KEY REQUIRED". The map is also locked to Cambodia on purpose.
- **Never reset or drop the Neon database without the user's explicit, fresh consent.** `prisma migrate reset` wipes the `public` schema, and Prisma's guard refuses it otherwise.
- **Prisma generate fails with `EPERM` while any Node process has the client loaded.** Stop the server first.
- **Git Bash mangles `taskkill /PID`.** Use `taskkill //PID <pid> //F`, and only stop processes you started. A leftover test server on the API port will keep answering the client and hide a real outage.
