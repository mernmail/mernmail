const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  req.receiveDriver.close();
  res.json({ email: req.credentials.email });
});

module.exports = router;
