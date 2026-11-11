require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CONNECTOR_TYPES = ["TYPE2", "CCS2", "CHADEMO", "GBT_AC", "GBT_DC"];

const parsePlugs = (raw = "") => [
  ...new Set(
    raw
      .split("/")
      .map((p) => p.trim().toUpperCase())
      .map((p) => (p === "GB-T" ? "GBT_DC" : p))
      .filter((p) => CONNECTOR_TYPES.includes(p)),
  ),
];

async function main() {
  const file = path.join(__dirname, "../data/stations.geojson");
  const { features } = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const f of features) {
    const p = f.properties;
    const [longitude, latitude] = f.geometry.coordinates; // GeoJSON is [lng, lat]
    const name = p["Location Name"].trim();
    const hoursText = (p["Operation Time"] || "").trim();
    const open24h = ["24/7", "24hrs"].includes(hoursText.toLowerCase());
    const connectors = parsePlugs(p["Plug Types"]);
    const externalId = `mef_${latitude}_${longitude}_${name}`;

    const data = { name, latitude, longitude, connectors, open24h, hoursText, source: "mef" };

    await prisma.evStation.upsert({
      where: { externalId },
      update: data,
      create: { externalId, ...data },
    });
  }

  console.log(`Imported ${features.length} stations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
