const { prisma } = require("../../libs/prisma");

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};

const list = (plug) =>
  prisma.evStation.findMany({
    where: plug ? { connectors: { has: plug } } : undefined,
    orderBy: { id: "asc" },
  });

const nearby = async (lat, lng, plug) => {
  const stations = await list(plug);
  return stations
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.latitude, s.longitude) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);
};

module.exports = { list, nearby };
