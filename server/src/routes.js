const express = require("express");

const evStationRoute = require("./modules/ev-stations/evStation.route");

const router = express.Router();

router.use("/ev-stations", evStationRoute);

module.exports = router;
