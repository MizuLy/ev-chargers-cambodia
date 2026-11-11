const { list, nearby } = require("./evStation.service");

const listHandler = async (req, res) => {
  res.json(await list(req.query.plug));
};

const nearbyHandler = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!req.query.lat || !req.query.lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "lat and lng must be numbers" });
  }
  res.json(await nearby(lat, lng, req.query.plug));
};

module.exports = { listHandler, nearbyHandler };
