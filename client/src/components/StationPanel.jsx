import { PLUG_FILTERS, markerColor, plugLabel } from "../utils/stations";

const chip = (active) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "border-lagoon bg-[#D5EFE6] font-semibold text-ink ring-1 ring-lagoon"
      : "border-line bg-white text-ink hover:border-lagoon"
  }`;

const LEGEND = [["GBT_DC"], ["CCS2"], ["GBT_DC", "CCS2"], []];

export default function StationPanel({
  stations,
  plug,
  setPlug,
  only24h,
  setOnly24h,
  query,
  setQuery,
  nearMe,
  onNearMe,
  onClearNearMe,
  locating,
  selectedId,
  onSelect,
  error,
}) {
  return (
    <aside className="flex h-[440px] w-full flex-col border-t border-line bg-paper md:h-full md:w-[390px] md:border-r md:border-t-0">
      <div className="space-y-3 border-b border-line p-4">
        <div>
          <h1 className="text-xl font-bold leading-tight">EV chargers in Cambodia</h1>
          <p className="text-sm text-muted">
            {stations.length} {stations.length === 1 ? "station" : "stations"}
            {nearMe ? " closest to you, updating live" : " shown"}
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by station name"
          aria-label="Search by station name"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm placeholder:text-muted"
        />

        <div className="flex flex-wrap gap-2">
          {PLUG_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setPlug(f.plug)}
              className={chip(plug === f.plug)}
              aria-pressed={plug === f.plug}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setOnly24h(!only24h)}
            className={chip(only24h)}
            aria-pressed={only24h}
          >
            Open 24 hours
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onNearMe}
            disabled={locating}
            className="flex-1 rounded-xl border border-lagoon bg-[#D5EFE6] px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#C3E8DB] disabled:opacity-60"
          >
            {locating ? "Finding you…" : "Find chargers near me"}
          </button>
          {nearMe && (
            <button
              onClick={onClearNearMe}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium"
            >
              Show all
            </button>
          )}
        </div>

        <ul
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted"
          aria-label="Marker colors"
        >
          {LEGEND.map((c) => (
            <li key={c.join()} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: markerColor(c) }}
              />
              {c.length ? plugLabel(c) : "Unknown"}
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <ul className="flex-1 divide-y divide-line overflow-y-auto">
        {stations.length === 0 && (
          <li className="p-6 text-sm text-muted">
            No stations match. Clear a filter or search for a different name.
          </li>
        )}
        {stations.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white ${
                selectedId === s.id ? "bg-white" : ""
              }`}
            >
              <span
                className="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ background: markerColor(s.connectors) }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="block text-xs text-muted">
                  {plugLabel(s.connectors)} ·{" "}
                  {s.open24h ? "Open 24 hours" : s.hoursText || "Hours unknown"}
                </span>
              </span>
              {s.distanceKm != null && (
                <span className="shrink-0 text-sm font-semibold text-lagoon">
                  {s.distanceKm.toFixed(1)} km
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
