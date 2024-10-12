const express = require("express");
const router = express.Router();

router.get("/mailboxes", (req, res) => {
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json({ mailboxes: mailboxes });
    req.receiveDriver.close();
  });
});

module.exports = router;
