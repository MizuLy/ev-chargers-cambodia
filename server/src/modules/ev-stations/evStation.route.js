const express = require("express");
const { listHandler, nearbyHandler } = require("./evStation.controller");

const router = express.Router();

router.get("/", listHandler);
router.get("/nearby", nearbyHandler);

module.exports = router;
