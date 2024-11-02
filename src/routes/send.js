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
              req.receiveDriver.appendSentMessage(
                messageBody,
                (err, sentMailbox) => {
                  const finalResponse = () => {
                    res.json({
                      message: "Message sent successfully",
                      sentMailbox: sentMailbox
                    });
                    req.receiveDriver.close();
                    sendDriver.close();
                  };
                  if (req.body.draftMailbox && req.body.draftId) {
                    req.receiveDriver.openMailbox(
                      req.body.draftMailbox,
                      (err) => {
                        if (err) {
                          finalResponse();
                          return;
                        }
                        req.receiveDriver.permanentlyDeleteMessages(
                          [req.body.draftId],
                          () => {
                            finalResponse();
                          }
                        );
                      }
                    );
                  } else {
                    finalResponse();
                  }
                }
              );
            }
          }
        );
      });
    }
  );
});

router.post("/draft", (req, res) => {
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
        req.receiveDriver.appendDraft(messageBody, (err, draftMailbox) => {
          if (err) {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
            sendDriver.close();
            return;
          } else {
            res.json({
              message: "Message sent successfully",
              draftMailbox: draftMailbox
            });
            req.receiveDriver.close();
            sendDriver.close();
            return;
          }
        });
      });
    }
  );
});

module.exports = router;
