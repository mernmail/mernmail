const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});
const express = require("express");
const serveStatic = require("serve-static");

const app = express();

app.use(serveStatic(path.join(__dirname, "../frontend/dist")));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
