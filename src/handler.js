const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});
if (!process.env.ATTACHMENTS_PATH) {
  process.env.ATTACHMENTS_PATH = path.join(__dirname, "..", "attachments");
  try {
    fs.mkdirSync(process.env.ATTACHMENTS_PATH);
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Error while creating the default attachments directory
  }
}
const express = require("express");
const serveStatic = require("serve-static");
const authAndInitReceiveMiddleware = require("./middleware/authAndInitReceive.js");
const checkRoute = require("./routes/check.js");
const receiveRoute = require("./routes/receive.js");

const app = express();

app.use("/api", authAndInitReceiveMiddleware);
app.use("/api/check", checkRoute);
app.use("/api/receive", receiveRoute);
app.use("/api", (req, res, next) => {
  if (req.receiveDriver) req.receiveDriver.close();
  next();
});
app.use(serveStatic(path.join(__dirname, "../frontend/dist")));

module.exports = app;
