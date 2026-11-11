const cors = require("cors");
const express = require("express");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
