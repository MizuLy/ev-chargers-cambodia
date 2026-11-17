import { LuChevronDown, LuChevronUp, LuClock } from "react-icons/lu";
import PlugBadge from "./ui/PlugBadge";
import { markerColor, plugLabel } from "../utils/stations";

// The list of stations. On desktop it fills the left panel under the filters. On phones it is a bottom sheet:
// a tap target showing the count, which opens a scrollable list with room to scroll.
export default function StationList({ stations, nearMe, selectedId, onSelect, open, onToggle }) {
  const count = `${stations.length} ${stations.length === 1 ? "station" : "stations"}${
    nearMe ? " closest to you, updating live" : " shown"
  }`;

  return (
    <section className="flex min-h-0 flex-col border-t border-line bg-white md:col-start-1 md:row-start-2 md:border-r md:border-t-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex flex-col items-stretch gap-1.5 px-4 pb-3 pt-2 text-left md:hidden"
      >
        <span className="mx-auto h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">{count}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-muted">
            {open ? "Hide list" : "Show list"}
            {open ? <LuChevronDown size={16} aria-hidden="true" /> : <LuChevronUp size={16} aria-hidden="true" />}
          </span>
        </span>
      </button>
      <p className="hidden border-b border-line bg-paper px-4 py-2 text-xs font-medium text-muted md:block">{count}</p>

      <ul
        className={`divide-y divide-line overflow-y-auto overscroll-contain border-t border-line md:min-h-0 md:flex-1 md:border-t-0 ${
          open ? "max-h-[46dvh]" : "hidden"
        } md:block md:max-h-none`}
      >
        {stations.length === 0 && (
          <li className="p-6 text-sm text-muted">No stations match. Clear a filter or search for a different name.</li>
        )}
        {stations.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper ${
                selectedId === s.id ? "bg-primaryTint" : ""
              }`}
            >
              <PlugBadge color={markerColor(s.connectors)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                  <span>{plugLabel(s.connectors)}</span>
                  <span aria-hidden="true">·</span>
                  <LuClock size={12} className="shrink-0" aria-hidden="true" />
                  <span>{s.open24h ? "Open 24 hours" : s.hoursText || "Hours unknown"}</span>
                </span>
              </span>
              {s.distanceKm != null && (
                <span className="shrink-0 text-sm font-semibold text-primaryDark">{s.distanceKm.toFixed(1)} km</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
