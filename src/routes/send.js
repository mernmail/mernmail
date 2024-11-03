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
                    const finalResponse2 = () => {
                      res.json({
                        message: "Message sent successfully",
                        sentMailbox: sentMailbox
                      });
                      req.receiveDriver.close();
                      sendDriver.close();
                    };
                    if (req.body.inReplyTo) {
                      req.receiveDriver.getMailboxes((err, mailboxes) => {
                        if (err) {
                          finalResponse2();
                          return;
                        }
                        const mailboxesToOpen = mailboxes.filter(
                          (mailbox) => mailbox.openable
                        );
                        const findOriginalMessage = (_id) => {
                          if (!_id) _id = 0;
                          if (_id >= mailboxesToOpen.length) {
                            finalResponse2();
                            return;
                          }
                          req.receiveDriver.openMailbox(
                            mailboxesToOpen[_id].id,
                            (err) => {
                              if (err) {
                                finalResponse2();
                                return;
                              }
                              req.receiveDriver.getRealAllMessages(
                                (err, messages) => {
                                  if (err) {
                                    finalResponse2();
                                    return;
                                  }
                                  const foundMessage = messages.find(
                                    (message) =>
                                      message.messageId == req.body.inReplyTo
                                  );
                                  if (foundMessage) {
                                    req.receiveDriver.markMessagesAsAnswered(
                                      [foundMessage.id],
                                      () => {
                                        finalResponse2();
                                      }
                                    );
                                  } else {
                                    req.receiveDriver.closeMailbox((err) => {
                                      if (err) {
                                        finalResponse2();
                                        return;
                                      }
                                      findOriginalMessage(_id + 1);
                                    });
                                  }
                                }
                              );
                            }
                          );
                        };
                        findOriginalMessage();
                      });
                    } else {
                      finalResponse2();
                    }
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
                            req.receiveDriver.closeMailbox(() => {
                              finalResponse();
                            });
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
        req.receiveDriver.appendDraft(messageBody, (err, draftsMailbox) => {
          if (err) {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
            sendDriver.close();
            return;
          } else {
            const finalResponse = () => {
              res.json({
                message: "Message sent successfully",
                draftsMailbox: draftsMailbox
              });
              req.receiveDriver.close();
              sendDriver.close();
            };
            if (req.body.draftMailbox && req.body.draftId) {
              req.receiveDriver.openMailbox(req.body.draftMailbox, (err) => {
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
              });
            } else {
              finalResponse();
            }
          }
        });
      });
    }
  );
});

module.exports = router;
