const express = require("express");
const MiniSearch = require("minisearch");
const dns = require("dns");
const { getAttachment } = require("../utils/attachments.js");
const defaultAvatar = require("../res/avatar.js");
const http = require("http");
const https = require("https");
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
    req.receiveDriver.getMessage(
      messageId,
      req.credentials.email,
      (err, messages) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        res.json({ messages: messages });
        req.receiveDriver.close();
      }
    );
  });
});

router.get("/attachment/:attachment", (req, res) => {
  req.receiveDriver.close();
  const attachmentHash = req.params.attachment;
  getAttachment(attachmentHash, req.credentials.email, (err, readStream) => {
    if (err && err.code == "ENOENT") {
      res.status(404).send("Attachment not found");
    } else if (err) {
      res.status(500).send(err.message);
    } else {
      readStream.pipe(res);
    }
  });
});

router.get("/capabilities", (req, res) => {
  res.json({ ...req.receiveDriver.capabilities });
  req.receiveDriver.close();
});

router.post("/unread/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res
      .status(400)
      .json({ message: "You need to provide messages to mark as unread" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.markMessagesAsUnread(req.body.messages, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ message: "Marked messages as unread successfully" });
      req.receiveDriver.close();
    });
  });
});

router.post("/read/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res
      .status(400)
      .json({ message: "You need to provide messages to mark as read" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.markMessagesAsRead(req.body.messages, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ message: "Marked messages as read successfully" });
      req.receiveDriver.close();
    });
  });
});

router.post("/spam/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res
      .status(400)
      .json({ message: "You need to provide messages to mark as spam" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.findSpamMailbox((err, spamMailbox) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      } else if (!spamMailbox) {
        res.status(500).json({ message: "Spam mailbox not found" });
        req.receiveDriver.close();
        return;
      } else if (spamMailbox == mailbox) {
        res
          .status(400)
          .json({ message: "Spam mailbox is the same as the source mailbox" });
        req.receiveDriver.close();
        return;
      }
      req.receiveDriver.moveMessages(req.body.messages, spamMailbox, (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        res.json({
          message: "Marked messages as spam successfully",
          spamMailbox: spamMailbox
        });
        req.receiveDriver.close();
      });
    });
  });
});

router.delete("/delete/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res.status(400).json({ message: "You need to provide messages to delete" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.deleteMessages(req.body.messages, (err, trashMailbox) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({
        message: "Deleted messages successfully",
        trashMailbox: trashMailbox
      });
      req.receiveDriver.close();
    });
  });
});

router.post("/star/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res.status(400).json({ message: "You need to provide messages to star" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.starMessages(req.body.messages, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ message: "Starred messages successfully" });
      req.receiveDriver.close();
    });
  });
});

router.post("/unstar/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res.status(400).json({ message: "You need to provide messages to unstar" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.unstarMessages(req.body.messages, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({ message: "Unstarred messages successfully" });
      req.receiveDriver.close();
    });
  });
});

router.post("/move/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    !req.body.destination ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res.status(400).json({
      message: "You need to provide messages and destination to move"
    });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    } else if (req.body.destination == mailbox) {
      res.status(400).json({
        message: "The destination mailbox is the same as the source mailbox"
      });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.moveMessages(
      req.body.messages,
      req.body.destination,
      (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        res.json({
          message: "Moved messages successfully"
        });
        req.receiveDriver.close();
      }
    );
  });
});

router.post("/toinbox/:mailbox*", (req, res) => {
  if (
    !req.body ||
    !req.body.messages ||
    (!Array.isArray(req.body.messages) &&
      typeof req.body.messages != "string") ||
    req.body.messages.length === 0
  ) {
    res
      .status(400)
      .json({ message: "You need to provide messages to move to inbox" });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.openMailbox(mailbox, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.findInbox((err, inbox) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      } else if (!inbox) {
        res.status(500).json({ message: "Inbox not found" });
        req.receiveDriver.close();
        return;
      } else if (inbox == mailbox) {
        res
          .status(400)
          .json({ message: "Inbox is the same as the source mailbox" });
        req.receiveDriver.close();
        return;
      }
      req.receiveDriver.moveMessages(req.body.messages, inbox, (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        res.json({
          message: "Moved messages to the inbox successfully",
          inbox: inbox
        });
        req.receiveDriver.close();
      });
    });
  });
});

router.get("/search/:query*", (req, res) => {
  const query = req.params.query + req.params[0];
  let allMessages = [];
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    const mailboxesToOpen = mailboxes.filter(
      (mailbox) =>
        mailbox.openable &&
        mailbox.type != "spam" &&
        mailbox.type != "trash" &&
        mailbox.type != "starred" &&
        mailbox.type != "important"
    );
    const getAllMessages = (callback, _id) => {
      if (!_id) _id = 0;
      if (_id >= mailboxesToOpen.length) {
        callback();
        return;
      }
      req.receiveDriver.openMailbox(mailboxesToOpen[_id].id, (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        req.receiveDriver.getRealAllMessages((err, messages) => {
          if (err) {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
            return;
          }
          allMessages = [
            ...allMessages,
            ...messages.map((message) => {
              message.id = mailboxesToOpen[_id].id + "/" + message.id;
              message.mailboxType = mailboxesToOpen[_id].type;
              return message;
            })
          ];
          req.receiveDriver.closeMailbox((err) => {
            if (err) {
              res.status(500).json({ message: err.message });
              req.receiveDriver.close();
              return;
            }
            getAllMessages(callback, _id + 1);
          });
        });
      });
    };
    getAllMessages(() => {
      var minisearch = new MiniSearch({
        fields: ["from", "to", "subject"],
        storeFields: [
          "seen",
          "starred",
          "answered",
          "date",
          "id",
          "subject",
          "from",
          "to",
          "messageId",
          "mailbox"
        ]
      });
      minisearch.addAll(allMessages);
      res.json({
        results: minisearch.search(query, { boost: { subject: 2 } })
      });
      req.receiveDriver.close();
    });
  });
});

router.get("/allmessages", (req, res) => {
  let allMessages = [];
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    const mailboxesToOpen = mailboxes.filter((mailbox) => mailbox.openable);
    const getAllMessages = (callback, _id) => {
      if (!_id) _id = 0;
      if (_id >= mailboxesToOpen.length) {
        callback();
        return;
      }
      req.receiveDriver.openMailbox(mailboxesToOpen[_id].id, (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
          return;
        }
        req.receiveDriver.getRealAllMessages((err, messages) => {
          if (err) {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
            return;
          }
          allMessages = [
            ...allMessages,
            ...messages.map((message) => {
              message.id = mailboxesToOpen[_id].id + "/" + message.id;
              message.mailboxType = mailboxesToOpen[_id].type;
              return message;
            })
          ];
          req.receiveDriver.closeMailbox((err) => {
            if (err) {
              res.status(500).json({ message: err.message });
              req.receiveDriver.close();
              return;
            }
            getAllMessages(callback, _id + 1);
          });
        });
      });
    };
    getAllMessages(() => {
      res.json({
        messages: allMessages
      });
      req.receiveDriver.close();
    });
  });
});

router.get("/avatar/:email/avatar.svg", (req, res) => {
  const emailDomainMatch = req.params.email.match(/@([^@]+)/);
  const emailDomain = emailDomainMatch ? emailDomainMatch[1] : "";
  if (!emailDomain) {
    res.end(defaultAvatar);
    return;
  }
  dns.resolveTxt(`default._bimi.${emailDomain}`, (err, records) => {
    if (err) {
      res.end(defaultAvatar);
      return;
    }
    let hasBIMIRecord = false;
    let logoPath = "https://example.com";
    records.every((recordArray) => {
      const record = recordArray.join(" ");
      const recordMatch = record.match(/(?:^|; *)([^; =]+)=([^;]*)(?=;|$)/g);
      if (!recordMatch) return true;
      recordMatch.forEach((property) => {
        const propertyMatch = property.match(
          /(?:^|; *)([^; =]+)=([^;]*)(?=;|$)/
        );
        if (propertyMatch) {
          if (propertyMatch[1] == "v" && propertyMatch[2] == "BIMI1") {
            hasBIMIRecord = true;
          } else if (propertyMatch[1] == "l") {
            logoPath = propertyMatch[2];
          }
        }
      });
      return !hasBIMIRecord;
    });
    if (!hasBIMIRecord) {
      res.end(defaultAvatar);
      return;
    }
    let logoPathURLObject = {};
    try {
      logoPathURLObject = new URL(logoPath);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      res.end(defaultAvatar);
      return;
    }
    if (
      logoPathURLObject.protocol != "http:" &&
      logoPathURLObject.protocol != "https:"
    ) {
      res.end(defaultAvatar);
      return;
    }
    (logoPathURLObject.protocol == "https:" ? https : http)
      .get(logoPath, (clientRes) => {
        if (clientRes.statusCode !== 200) {
          res.end(defaultAvatar);
          return;
        } else {
          clientRes.pipe(res);
        }
      })
      .on("error", () => {
        res.end(defaultAvatar);
      });
  });
});

router.post("/mailbox", (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).json({
      message: "You need to provide a name for a mailbox"
    });
    req.receiveDriver.close();
    return;
  }
  req.receiveDriver.createMailbox(req.body.name, (err) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    }
    res.json({
      message: "Created mailbox successfully"
    });
    req.receiveDriver.close();
  });
});

router.post("/mailbox/:mailbox*", (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).json({
      message: "You need to provide a new name for a mailbox"
    });
    req.receiveDriver.close();
    return;
  }
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    } else if (
      mailboxes.find(
        (mailboxFromTheList) =>
          mailboxFromTheList.id == mailbox &&
          mailboxFromTheList.type != "normal"
      )
    ) {
      res.status(403).json({ message: "Operation not allowed" });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.renameMailbox(mailbox, req.body.name, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({
        message: "Renamed mailbox successfully"
      });
      req.receiveDriver.close();
    });
  });
});

router.delete("/mailbox/:mailbox*", (req, res) => {
  const mailbox = req.params.mailbox + req.params[0];
  req.receiveDriver.getMailboxes((err, mailboxes) => {
    if (err) {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
      return;
    } else if (
      mailboxes.find(
        (mailboxFromTheList) =>
          mailboxFromTheList.id == mailbox &&
          mailboxFromTheList.type != "normal"
      )
    ) {
      res.status(403).json({ message: "Operation not allowed" });
      req.receiveDriver.close();
      return;
    }
    req.receiveDriver.deleteMailbox(mailbox, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        req.receiveDriver.close();
        return;
      }
      res.json({
        message: "Deleted mailbox successfully"
      });
      req.receiveDriver.close();
    });
  });
});

module.exports = router;
