import { LuInfo, LuLocateFixed } from "react-icons/lu";

// where the user is, in words, shown at the right of the navbar
function LocationChip({ status, place, onRetry }) {
  const base =
    "inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm";
  const dot = <LuLocateFixed size={16} className="shrink-0 text-[#2563EB]" aria-hidden="true" />;

  if (status === "tracking") {
    const label = place?.label || "Your location is on the map";
    const outside = place && !place.inCambodia;
    return (
      <p className={base} title={outside ? "All charging stations are in Cambodia" : undefined}>
        {dot}
        <span className="truncate font-semibold">{label}</span>
        {outside && <span className="hidden shrink-0 text-muted sm:inline">Stations are in Cambodia</span>}
      </p>
    );
  }
  if (status === "locating") return <p className={`${base} text-muted`}>Finding your location…</p>;
  return (
    <p
      className={`${base} text-muted`}
      title={status === "denied" ? "Allow location in your browser's site settings" : undefined}
    >
      <span className="truncate">{status === "denied" ? "Location is off" : "Location unavailable"}</span>
      <button onClick={onRetry} className="shrink-0 font-semibold text-ink underline">
        Try again
      </button>
    </p>
  );
}

export default function Navbar({ status, place, onRetry, onInfo }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-4">
      <a href="/" className="flex shrink-0 items-center text-ink no-underline">
        <img src="/ppi-logo.png" alt="People & Partners Insurance PLC" className="h-11 w-auto" />
      </a>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <LocationChip status={status} place={place} onRetry={onRetry} />
        <button
          onClick={onInfo}
          aria-label="Plug guide: which plug does my car use?"
          title="Plug guide"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 text-sm font-medium text-ink hover:border-primary md:px-3"
        >
          <LuInfo size={18} aria-hidden="true" />
          <span className="hidden md:inline">Plug guide</span>
        </button>
      </div>
    </header>
  );
}
