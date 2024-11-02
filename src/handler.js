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
const mongoose = require("mongoose");
const serveStatic = require("serve-static");
const authAndInitReceiveMiddleware = require("./middleware/authAndInitReceive.js");
const checkRoute = require("./routes/check.js");
const loginRoute = require("./routes/login.js");
const logoutRoute = require("./routes/logout.js");
const receiveRoute = require("./routes/receive.js");
const sendRoute = require("./routes/send.js");
const settingsRoute = require("./routes/settings.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

mongoose
  .connect(process.env.MONGODB_CONNSTRING)
  .then(() => console.log(`Database connected successfully`));

// Since mongoose's Promise is deprecated, we override it with Node's Promise
mongoose.Promise = global.Promise;

const app = express();

app.use(cookieParser());

app.use("/api", bodyParser.json({ limit: "50mb" }));
app.use("/api/login", loginRoute);
app.use("/api", authAndInitReceiveMiddleware);
app.use("/api/logout", logoutRoute);
app.use("/api/check", checkRoute);
app.use("/api/send", sendRoute);
app.use("/api/receive", receiveRoute);
app.use("/api/settings", settingsRoute);
app.use("/api", (req, res, next) => {
  if (req.receiveDriver) req.receiveDriver.close();
  next();
});
app.use(serveStatic(path.join(__dirname, "../frontend/dist")));

module.exports = app;
