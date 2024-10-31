const initSendDriver = require("../utils/initSendDriver.js");
const express = require("express");
const router = express.Router();

router.post("/send", (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: "The body is required" });
    return;
  }
  initSendDriver(
    req.credentials.email,
    req.credentials.password,
    (err, sendDriver) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      sendDriver.compose(req.body, false, (err, messageBody) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          sendDriver.close();
          return;
        }
        sendDriver.send(
          req.body.from,
          req.body.to,
          req.body.cc,
          req.body.bcc,
          messageBody,
          (err) => {
            if (err) {
              res.status(500).json({ message: err.message });
              req.receiveDriver.close();
              sendDriver.close();
              return;
            } else {
              res.json({ message: "Message sent successfully" });
              req.receiveDriver.close();
              sendDriver.close();
              return;
            }
          }
        );
      });
    }
  );
});

module.exports = router;
