import { LuLocateFixed } from "react-icons/lu";
import PlugBadge from "./ui/PlugBadge";
import { PLUG_FILTERS, markerColor, plugLabel } from "../utils/stations";

const chip = (active) =>
  `shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-primary bg-primary font-semibold text-ink" : "border-line bg-white text-ink hover:border-primary"
  }`;

const LEGEND = [["GBT_DC"], ["CCS2"], ["GBT_DC", "CCS2"], []];
const primaryButton =
  "rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60";
const secondaryButton = "rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium hover:border-primary";

// Search, plug and hours filters, and the "near me" button. On phones it is a compact bar at the top of the
// screen (one row for search and near me, one scrollable row of chips); on desktop it heads the left panel.
export default function FilterBar({
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
  error,
}) {
  return (
    <section className="space-y-2.5 border-b border-line bg-white p-3 md:col-start-1 md:row-start-1 md:space-y-3 md:border-r md:p-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by station name"
          aria-label="Search by station name"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm placeholder:text-muted"
        />
        {/* phone: a compact button next to the search box */}
        {nearMe ? (
          <button onClick={onClearNearMe} className={`${secondaryButton} shrink-0 md:hidden`}>
            Show all
          </button>
        ) : (
          <button onClick={onNearMe} disabled={locating} className={`${primaryButton} flex shrink-0 items-center gap-1.5 md:hidden`}>
            <LuLocateFixed size={16} aria-hidden="true" />
            {locating ? "Finding…" : "Near me"}
          </button>
        )}
      </div>

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {PLUG_FILTERS.map((f) => (
          <button key={f.label} onClick={() => setPlug(f.plug)} className={chip(plug === f.plug)} aria-pressed={plug === f.plug}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setOnly24h(!only24h)} className={chip(only24h)} aria-pressed={only24h}>
          Open 24 hours
        </button>
      </div>

      {/* desktop: the full-width button row */}
      <div className="hidden gap-2 md:flex">
        <button onClick={onNearMe} disabled={locating} className={`${primaryButton} flex-1`}>
          {locating ? "Finding you…" : "Find chargers near me"}
        </button>
        {nearMe && (
          <button onClick={onClearNearMe} className={secondaryButton}>
            Show all
          </button>
        )}
      </div>

      <ul className="hidden flex-wrap gap-x-4 gap-y-1 text-xs text-muted md:flex" aria-label="Marker colors">
        {LEGEND.map((c) => (
          <li key={c.join()} className="flex items-center gap-1.5">
            <PlugBadge color={markerColor(c)} size="sm" />
            {c.length ? plugLabel(c) : "Unknown"}
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
