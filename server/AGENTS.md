# Repository Guidelines (server)

Read-only JSON API for an EV charging station map of Cambodia. CommonJS Express 5, Prisma 6, Neon Postgres. The React client lives in `../client`.

## Project Structure & Module Organization

- `src/server.js` loads `.env`, then calls `app.listen` on `PORT` (default 3000; the local `.env` uses 6969).
- `src/app.js` wires `cors()`, `express.json()`, mounts `src/routes.js` at `/api`, and ends with the error-handling middleware. Express 5 forwards async errors to it automatically.
- `src/routes.js` is the single place routes are mounted. Add each new module with `router.use("/<name>", require("./modules/<name>/<name>.route"))`. Do not mount routes directly in `app.js`.
- `src/modules/<feature>/` holds `*.route.js` (HTTP wiring only), `*.controller.js` (parse and validate the request, shape the response), and `*.service.js` (logic and Prisma calls). The current feature is `ev-stations`.
- `src/libs/prisma.js` exports `{ prisma }`, the one shared client. Never create another `PrismaClient` inside `src/`.
- `src/configs/`, `src/middlewares/`, `src/utils/` exist as empty placeholders. `scripts/` holds the import script, `data/` the source GeoJSON, `docs/` documentation, `tests/` future tests.
- `package.json` still lists starter dependencies (bcrypt, jsonwebtoken, cloudinary, multer, zod, morgan, express-rate-limit, cookie-parser) that nothing uses yet. There is no authentication, so do not assume any exists.

## API

Read-only: do not add create, update or delete endpoints unless asked.

- `GET /api/ev-stations?plug=` returns all stations ordered by id, optionally filtered with `connectors: { has: plug }`.
- `GET /api/ev-stations/nearby?lat=&lng=&plug=` returns the 10 closest stations with `distanceKm` (haversine in JS, ascending). It returns 400 with `{ error }` when `lat` or `lng` is missing or not a number.
- The current client no longer calls `/nearby`: it loads the full list once and filters and sorts in the browser. Keep the endpoint working anyway.

## Data & Database

- One model, `EvStation`, mapped to `ev_stations`: `id`, `externalId` (unique), `name`, `latitude`, `longitude`, `connectors String[]`, `open24h`, `hoursText?`, `source` (default `"mef"`), `createdAt`, `updatedAt`, with an index on `[latitude, longitude]`. There is deliberately no second table.
- Valid connector values: `TYPE2`, `CCS2`, `CHADEMO`, `GBT_AC`, `GBT_DC`. Source `GB-T` maps to `GBT_DC`. `Unknown` and `CCS/SAE` become an empty array on purpose.
- `npm run import:stations` runs `scripts/import-stations.js`, which upserts all 104 stations from `data/stations.geojson` by `externalId = mef_${lat}_${lng}_${trimmedName}`, so re-running is safe. Duplicate stations at the same coordinates are kept on purpose (for example both "Krong Stueng Saen" entries). GeoJSON coordinates are `[lng, lat]`. `open24h` is true for `24/7` or `24hrs`, case-insensitive.
- Expected counts after an import: 104 stations, 99 with `GBT_DC`, 57 with `CCS2`, 85 open 24 hours, 2 with no connectors.

## Build, Test, and Development Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev     # needs DATABASE_URL in .env
npm run import:stations
npm run dev                # nodemon src/server.js
npm start                  # node src/server.js
```

There is no build step and no test runner. `npm test` is a placeholder that exits with an error, so it is not a validation command.

Verify changes by running the server and calling the API, for example `curl localhost:6969/api/ev-stations` (expect 104 items), `?plug=GBT_DC` (99), `?plug=CCS2` (57), and `/nearby?lat=11.55&lng=104.92` (10 items sorted by `distanceKm`; a missing `lat`/`lng` returns 400).

## Gotchas

- **Prisma generate fails with `EPERM` on `query_engine-windows.dll.node`** while any Node process (nodemon, a test server) has the client loaded. Stop the server, then re-run `npx prisma generate`.
- **`prisma migrate dev` cannot prompt in a non-interactive shell**, and `prisma migrate reset` drops the whole `public` schema on the Neon database. Prisma's AI guard also refuses to reset without the user's fresh, explicit consent. Never reset or drop data without asking first.
- **On Windows in Git Bash**, `taskkill /PID` is mangled into a path. Use `taskkill //PID <pid> //F`. Do not kill every `node.exe`; stop only the process you started (find it with `netstat -ano | grep :<port>`).
- Stop any test server you start. A leftover process keeps answering the client and hides the fact that the real server is down.

## Coding Style & Naming Conventions

CommonJS (`require`/`module.exports`), two-space indentation, semicolons, camelCase variables and functions, feature-oriented filenames (`evStation.service.js`). Keep route handlers thin; put validation and logic in the module. Keep code short and simple, and do not add features that were not asked for. Run ESLint if configuration is added; keep formatting changes separate from behavior changes.

## Testing Guidelines

No framework yet. When one is added, use `tests/unit/` and `tests/integration/`, name files `*.test.js`, cover success, validation and error paths, and make the command runnable without production secrets.

## Environment

Keep secrets in `.env`, which is gitignored and must never be committed or printed. `.env.example` documents `DATABASE_URL` and `PORT`. Keep `PORT` in sync with `VITE_API_BASE` in `../client/.env`.

## Commit & Pull Request Guidelines

Short imperative messages such as `Add nearby endpoint`, one focused change per commit. Pull requests should explain the behavior change, list verification commands, note Prisma schema or migration changes, and show example requests and responses when endpoints change. Never include `.env` values or credentials.
