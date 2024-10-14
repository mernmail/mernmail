const express = require("express");
const router = express.Router();

// POST method to prevent logout CSRF
router.post("/", (req, res) => {
  req.receiveDriver.close();
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
