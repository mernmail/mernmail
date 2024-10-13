const express = require("express");
const router = express.Router();

router.get("/mailboxes", (req, res) => {
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    res.json({ mailboxes: mailboxes });
    req.receiveDriver.close();
  });
});

router.get("/mailbox/:mailbox*", (req, res) => {
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.getAllMessages((err, messages) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ messages: messages });
      req.receiveDriver.close();
    });
  });
});

router.get("/message/:message*", (req, res, next) => {
  const messageArray = (req.params.message + req.params[0]).split("/");
  if (messageArray.length < 2) {
    next();
    return;
  }
  const messageId = messageArray.pop();
  const mailbox = messageArray.join("/");
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.getMessage(messageId, (err, messages) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ messages: messages });
      req.receiveDriver.close();
    });
  });
});

module.exports = router;
