export const PLUG_FILTERS = [
  { label: "All plugs", plug: "" },
  { label: "GB/T", plug: "GBT_DC" },
  { label: "CCS2", plug: "CCS2" },
];

const LABELS = { GBT_DC: "GB/T", GBT_AC: "GB/T AC", CCS2: "CCS2", TYPE2: "Type 2", CHADEMO: "CHAdeMO" };

export const plugName = (type) => LABELS[type] || type;

export const plugColor = (type) => markerColor([type]);

export const plugLabel =(connectors) => connectors.map((c) => LABELS[c] || c).join(" + ") || "Plugs unknown";

export const markerColor = (connectors) => {
  const gbt = connectors.includes("GBT_DC");
  const ccs = connectors.includes("CCS2");
  if (gbt && ccs) return "#5B4FD6";
  if (gbt) return "#0E7C66";
  if (ccs) return "#E08A12";
  return "#8A948F";
};

const toRad = (deg) => (deg * Math.PI) / 180;

export const distanceKm = ([lat1, lng1], [lat2, lng2]) => {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};
