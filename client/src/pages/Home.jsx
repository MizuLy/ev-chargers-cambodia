import { useMemo } from "react";
import EvMap from "../components/EvMap";
import useStations from "../hooks/useStations";
import { markerColor } from "../utils/stations";

const wrap = "mx-auto w-full max-w-6xl px-4 md:px-6";
const button =
  "inline-flex items-center justify-center rounded-xl border px-5 py-3 text-base font-semibold text-ink transition-colors";

function Bolt() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0E7C66" />
      <path d="M17.6 5 8.6 17.6h5.8L13 27l9.4-12.6h-5.8Z" fill="#F6F7F3" />
    </svg>
  );
}

export default function Home() {
  const { stations, error } = useStations();

  const stats = useMemo(
    () =>
      stations.length
        ? {
            total: stations.length,
            open24h: stations.filter((s) => s.open24h).length,
            gbt: stations.filter((s) => s.connectors.includes("GBT_DC")).length,
            ccs2: stations.filter((s) => s.connectors.includes("CCS2")).length,
          }
        : null,
    [stations],
  );

  const n = (key) => (stats ? stats[key] : "–");

  return (
    <div className="min-h-full bg-paper font-instrumentsans text-ink">
      <header className={`${wrap} flex items-center justify-between py-4`}>
        <a href="#top" className="flex items-center gap-2.5 font-bold no-underline text-ink">
          <Bolt />
          EV chargers Cambodia
        </a>
        <nav className="flex gap-5 text-sm font-medium text-muted">
          <a href="#map" className="hover:text-ink">Map</a>
          <a href="#plugs" className="hover:text-ink">Plug guide</a>
        </nav>
      </header>

      <main id="top">
        <section className={`${wrap} pb-10 pt-10 md:pb-14 md:pt-16`}>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Find an EV charger anywhere in Cambodia
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Browse every known charging station, filter by plug type and opening hours, and see which ones are
            closest to where you are right now.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#map" className={`${button} border-lagoon bg-[#D5EFE6] hover:bg-[#C3E8DB]`}>
              Open the map
            </a>
            <a href="#plugs" className={`${button} border-line bg-white hover:border-lagoon`}>
              Which plug do I need?
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
            {[
              ["total", "Charging stations"],
              ["open24h", "Open 24 hours"],
              ["gbt", "With GB/T plugs"],
              ["ccs2", "With CCS2 plugs"],
            ].map(([key, label]) => (
              <div key={key} className="border-t border-line pt-3">
                <dd className="m-0 text-3xl font-bold">{n(key)}</dd>
                <dt className="text-sm text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section id="map" className={`${wrap} scroll-mt-4 py-8 md:py-10`}>
          <h2 className="text-2xl font-bold md:text-3xl">Find a charger</h2>
          <p className="mb-5 mt-1 max-w-xl text-muted">
            Search by name, filter by plug, or use your location to see the 10 closest stations.
          </p>
          <EvMap stations={stations} loadError={error} />
        </section>

        <section id="plugs" className={`${wrap} scroll-mt-4 py-8 md:py-12`}>
          <h2 className="text-2xl font-bold md:text-3xl">Which plug does your car use?</h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              {
                type: "GBT_DC",
                name: "GB/T",
                text: "The Chinese standard for DC fast charging.",
                count: n("gbt"),
              },
              {
                type: "CCS2",
                name: "CCS2",
                text: "The European standard for DC fast charging. It is a Type 2 port with two extra pins below.",
                count: n("ccs2"),
              },
            ].map((p) => (
              <div key={p.type} className="border-t border-line pt-4">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: markerColor([p.type]) }} />
                  {p.name}
                </h3>
                <p className="mt-1.5 max-w-md text-muted">{p.text}</p>
                <p className="mt-2 text-sm font-semibold">{p.count} stations</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-xl text-sm text-muted">
            Not sure which one you have? Look for a label near your car's charge port, or check the owner's manual.
          </p>
        </section>
      </main>

      <footer className={wrap}>
        <p className="border-t border-line py-6 text-sm text-muted">
          Station details can change. Check the opening hours before you drive out. Map data © OpenStreetMap
          contributors.
        </p>
      </footer>
    </div>
  );
}
