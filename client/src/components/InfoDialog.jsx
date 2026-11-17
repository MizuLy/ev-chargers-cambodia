import { useEffect, useRef, useState } from "react";
import { LuX, LuZoomIn } from "react-icons/lu";
import PlugBadge from "./ui/PlugBadge";
import { markerColor } from "../utils/stations";

// Pictures of the two plugs (EVESCO infographics, supplied by the site owner). The GB/T picture shows the AC plug,
// so its caption says that the DC fast-charging plug is a different connector.
const PLUG_PICTURES = [
  {
    name: "GB/T",
    src: "/guide/plugs/gbt-ac-connector-1024x1024.png",
    alt: "The GB/T AC plug and socket: a round connector with seven contacts",
    caption: "GB/T. This is the AC plug. The DC fast-charging plug is a separate connector.",
  },
  {
    name: "CCS2",
    src: "/guide/plugs/CCS-2-DC-EV-charging-connector-socket-and-plug-EVESCO-1024x1024.png",
    alt: "The CCS2 DC plug and socket: a Type 2 round port with two large DC pins below it",
    caption: "CCS2 for DC fast charging.",
  },
];

// Plain-language explanations. Which plug a car has depends on the market it was built for, so this avoids a
// per-model table that could be wrong; brands are given only as examples of where each standard comes from.
const brand = (name, file) => ({ name, src: `/guide/brands/${file}` });
const PLUGS = [
  {
    connectors: ["GBT_DC"],
    name: "GB/T",
    text: "The Chinese charging standard. Cars built for China use it, for example many BYD, Geely, Zeekr, NIO and XPeng models sold there, and China-market versions of foreign brands. These cars usually have two separate ports: one for AC and one for DC fast charging.",
    brands: [brand("BYD", "byd.svg"), brand("Geely", "geely.svg"), brand("Zeekr", "zeekr.svg"), brand("NIO", "nio.svg"), brand("XPeng", "xpeng.svg")],
  },
  {
    connectors: ["CCS2"],
    name: "CCS2",
    text: "The European standard, also common in Asia-Pacific. It looks like a Type 2 AC port with two extra pins underneath, so AC and DC fast charging share one port. Cars built for Europe and similar markets use it, for example Volkswagen, BMW and Mercedes-Benz models sold there, and export versions of many Chinese brands. Which export models have it varies by model and year.",
    brands: [brand("Volkswagen", "volkswagen.svg"), brand("BMW", "bmw.svg"), brand("Mercedes-Benz", "mercedes-benz.svg")],
  },
  {
    connectors: ["GBT_DC", "CCS2"],
    name: "GB/T and CCS2",
    text: "The station has both plugs. A car with either one can charge there.",
  },
  {
    connectors: [],
    name: "Unknown",
    text: "The plug type is not listed for this station. Call ahead before you drive out.",
  },
];

const link = "font-semibold text-primaryDark underline";

export default function InfoDialog({ open, onClose }) {
  const ref = useRef(null);

  // the native <dialog> gives us the backdrop, focus handling and the Escape key
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // a second dialog on top of the guide shows the clicked plug picture enlarged
  const [zoomed, setZoomed] = useState(null);
  const zoomRef = useRef(null);
  useEffect(() => {
    const dialog = zoomRef.current;
    if (zoomed && !dialog.open) dialog.showModal();
    if (!zoomed && dialog.open) dialog.close();
  }, [zoomed]);

  return (
    <dialog
      ref={ref}
      onClose={(e) => e.target === ref.current && onClose()} // React also passes up the enlarged picture's close event
      onClick={(e) => e.target === ref.current && onClose()} // a click on the dimmed backdrop
      aria-labelledby="plug-guide-title"
      className="max-h-[88dvh] w-[min(560px,calc(100vw-1.5rem))] rounded-2xl bg-white p-0 font-instrumentsans text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id="plug-guide-title" className="text-lg font-bold leading-snug">
          Which plug does my car use?
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink"
        >
          <LuX size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[calc(88dvh-4.5rem)] space-y-5 overflow-y-auto overscroll-contain px-5 py-4 text-sm">
        <p className="text-muted">
          It depends on the market your car was built for, not only the brand. The same model can come with different
          plugs in different countries, so check your own car.
        </p>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
          {PLUG_PICTURES.map((p) => (
            <figure key={p.name}>
              <button
                type="button"
                onClick={() => setZoomed(p)}
                aria-label={`Enlarge the ${p.name} plug picture`}
                className="relative block w-full cursor-zoom-in overflow-hidden rounded-xl"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  width="1024"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
                <span
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow"
                  aria-hidden="true"
                >
                  <LuZoomIn size={16} />
                </span>
              </button>
              <figcaption className="mt-1.5 text-xs text-muted">{p.caption}</figcaption>
            </figure>
          ))}
        </div>

        <ul className="space-y-4">
          {PLUGS.map((p) => (
            <li key={p.name} className="flex gap-3">
              <PlugBadge color={markerColor(p.connectors)} />
              <div className="min-w-0">
                <p className="font-semibold">{p.name}</p>
                <p className="mt-0.5 text-muted">{p.text}</p>
                {p.brands && (
                  <ul className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2.5" aria-label={`${p.name} brand examples`}>
                    {p.brands.map((b) => (
                      <li key={b.name} className="flex items-center">
                        <img src={b.src} alt={b.name} loading="lazy" className="h-6 w-auto max-w-[96px] object-contain" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>

        <section>
          <h3 className="font-bold">How to check your car</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted">
            <li>Look at the DC charge port on your car, or in the owner's manual.</li>
            <li>A Type 2 port with two extra pins below it is CCS2. A separate DC port next to the AC port is usually GB/T.</li>
            <li>Adapters between the two exist, but ask your car's maker or dealer before using one.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold">Good to know</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted">
            <li>Distances in the list are straight-line, not driving distance.</li>
            <li>Opening hours are as listed and can be out of date. Check before you drive out.</li>
            <li>Pins on the map use the same colors as above.</li>
          </ul>
        </section>

        <div className="space-y-1 border-t border-line pt-3 text-xs text-muted">
          <p>
            General information from{" "}
            <a
              className={link}
              href="https://www.gacgroup.com/en/news/article/ev-standards-key-differences-across-major-markets-277"
              target="_blank"
              rel="noreferrer"
            >
              GAC Global
            </a>{" "}
            and{" "}
            <a
              className={link}
              href="https://abetterrouteplanner.com/resources/article/2026-02-09_global-ev-connectors"
              target="_blank"
              rel="noreferrer"
            >
              A Better Routeplanner
            </a>
            .
          </p>
          <p>
            Plug pictures from EVESCO. Brand names and logos belong to their owners and are shown only to identify
            cars.
          </p>
        </div>
      </div>

      <dialog
        ref={zoomRef}
        onClose={() => setZoomed(null)}
        onClick={(e) => e.target === zoomRef.current && setZoomed(null)} // a click on the dimmed backdrop
        aria-label={zoomed ? `${zoomed.name} plug picture, enlarged` : undefined}
        className="max-h-[94dvh] max-w-[94vw] overflow-visible rounded-xl bg-transparent p-0 backdrop:bg-ink/70"
      >
        {zoomed && (
          <div className="relative">
            <img src={zoomed.src} alt={zoomed.alt} className="block max-h-[90dvh] max-w-[92vw] rounded-xl object-contain" />
            <button
              onClick={() => setZoomed(null)}
              aria-label="Close enlarged picture"
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow"
            >
              <LuX size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </dialog>
    </dialog>
  );
}
