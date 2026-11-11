import { plugColor, plugName } from "../utils/stations";

export default function StationPopup({ station: s }) {
  return (
    <div className="w-[260px] font-instrumentsans">
      <div className="px-4 pb-3 pt-4">
        <h2 className="m-0 pr-7 text-base font-bold leading-snug text-ink">{s.name}</h2>

        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted">
          <span
            className={`inline-block h-2 w-2 rounded-full ${s.open24h ? "bg-lagoon" : "bg-[#8A948F]"}`}
            aria-hidden="true"
          />
          {s.open24h ? "Open 24 hours" : s.hoursText || "Hours unknown"}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.connectors.length ? (
            s.connectors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink"
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: plugColor(c) }} />
                {plugName(c)}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">Plug type not listed</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-paper px-4 py-3">
        {s.distanceKm != null && (
          <span className="text-sm font-bold text-lagoon">{s.distanceKm.toFixed(1)} km</span>
        )}
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
          className="flex-1 rounded-xl border border-lagoon bg-[#D5EFE6] px-3 py-2 text-center text-sm font-semibold !text-ink no-underline transition-colors hover:bg-[#C3E8DB]"
        >
          Get directions
        </a>
      </div>
    </div>
  );
}
