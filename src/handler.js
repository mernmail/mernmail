const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});
const express = require("express");
const serveStatic = require("serve-static");
const authAndInitReceiveMiddleware = require("./middleware/authAndInitReceive.js");
const checkRoute = require("./routes/check.js");

const app = express();

app.use("/api", authAndInitReceiveMiddleware);
app.use("/api/check", checkRoute);
app.use("/api", (req, res, next) => {
  if (req.receiveDriver) req.receiveDriver.close();
  next();
});
app.use(serveStatic(path.join(__dirname, "../frontend/dist")));

module.exports = app;
