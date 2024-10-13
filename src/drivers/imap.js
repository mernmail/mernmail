const Imap = require("imap-node");
const emailParser = require("mailparser").simpleParser;

module.exports = function init(email, password, callback) {
  const imap = new Imap({
    user: email,
    password: password,
    host: process.env.EMAIL_RECV_HOST,
    port: process.env.EMAIL_RECV_PORT,
    tls: parseInt(process.env.EMAIL_RECV_TLS) > 0
  });

  imap.once("ready", () => {
    const receiveObject = {
      close: () => {
        imap.end();
      },
      getMailboxes: (callback) => {
        imap.getBoxes((err, mailboxes) => {
          if (err) {
            callback(err);
            return;
          }
          const resultMailboxes = [];
          const recurseMailBoxes = (mailboxes, prefix, level) => {
            if (!level) level = 0;
            Object.keys(mailboxes).forEach((mailboxName) => {
              const currentPath =
                (prefix ? prefix + mailboxes[mailboxName].delimiter : "") +
                mailboxName;
              const openable =
                mailboxes[mailboxName].attribs.indexOf("\\NOSELECT") == -1;
              let type = "normal";
              if (currentPath == "INBOX") {
                type = "inbox";
              } else {
                mailboxes[mailboxName].attribs.forEach((attrib) => {
                  if (attrib == "\\Flagged") {
                    type = "starred";
                  } else if (attrib == "\\Important") {
                    type = "important";
                  } else if (attrib == "\\Sent") {
                    type = "sent";
                  } else if (attrib == "\\Drafts") {
                    type = "drafts";
                  } else if (attrib == "\\All") {
                    type = "all";
                  } else if (attrib == "\\Junk") {
                    type = "spam";
                  } else if (attrib == "\\Trash") {
                    type = "trash";
                  }
                });
              }
              resultMailboxes.push({
                id: currentPath,
                name: mailboxName,
                type: type,
                openable: openable,
                level: level,
                new: 0
              });
              if (mailboxes[mailboxName].children) {
                recurseMailBoxes(
                  mailboxes[mailboxName].children,
                  currentPath,
                  level + 1
                );
              }
            });
          };
          recurseMailBoxes(mailboxes, null);
          const getMailboxStatuses = (callback2, _id) => {
            if (!_id) _id = 0;
            if (_id >= resultMailboxes.length) {
              callback2();
              return;
            }
            imap.status(resultMailboxes[_id].id, (err, box) => {
              if (!err) {
                resultMailboxes[_id].new = box.messages.unseen;
              }
              getMailboxStatuses(callback2, _id + 1);
            });
          };
          getMailboxStatuses(() => {
            callback(null, resultMailboxes);
          });
        });
      },
      openMailbox: (mailbox, callback) => {
        imap.openBox(mailbox, (err) => {
          if (err) {
            callback(err);
            return;
          }
          callback(null);
        });
      },
      getAllMessages: (callback) => {
        imap.search(["ALL"], (err, messages) => {
          if (err) {
            callback(err);
            return;
          }
          const finalMessages = [];
          if (messages.length == 0) {
            callback(null, []);
            return;
          }
          const imapFetch = imap.fetch(messages, {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT MESSAGE-ID IN-REPLY-TO)"
          });
          imapFetch.on("message", (msg, id) => {
            let attributesSet = false;
            let bodyParsed = false;
            const finalAttributes = {
              seen: false,
              starred: false,
              answered: false,
              date: new Date(),
              id: id,
              subject: "Unknown email",
              from: "Unknown",
              to: "Unknown",
              messageId: null
            };
            const replyIds = [];

            msg.on("body", (bodyStream) => {
              emailParser(bodyStream)
                .then((parsed) => {
                  const fromArray =
                    parsed.from && parsed.from.value
                      ? parsed.from.value || []
                      : [];
                  const fromArray2 = [];
                  fromArray.forEach((fromObject) => {
                    fromArray2.push(
                      fromObject
                        ? fromObject.name
                          ? fromObject.name
                          : fromObject.address
                        : "Unknown"
                    );
                  });
                  const from = fromArray2.join(", ");
                  finalAttributes.from = from;
                  const toArray =
                    parsed.to && parsed.to.value ? parsed.to.value || [] : [];
                  const toArray2 = [];
                  toArray.forEach((toObject) => {
                    toArray2.push(
                      toObject
                        ? toObject.name
                          ? toObject.name
                          : toObject.address
                        : "Unknown"
                    );
                  });
                  const to = toArray2.join(", ");
                  finalAttributes.to = to;
                  finalAttributes.subject = parsed.subject;
                  finalAttributes.messageId = parsed.messageId;
                  if (parsed.inReplyTo) replyIds.push(parsed.inReplyTo);
                  if (attributesSet) {
                    finalMessages.push(finalAttributes);
                    if (finalMessages.length == messages.length) {
                      finalMessages.sort((a, b) => {
                        return messages.indexOf(a.id) - messages.indexOf(b.id);
                      });
                      const realFinalMessages = finalMessages
                        .filter((msg) => {
                          return replyIds.indexOf(msg.messageId) == -1;
                        })
                        .map((msg) => {
                          msg.messageId = undefined;
                          return msg;
                        });
                      callback(null, realFinalMessages);
                    }
                  }
                  bodyParsed = true;
                })
                .catch(() => {
                  bodyParsed = true;
                });
            });
            msg.on("attributes", (attributes) => {
              attributes.flags.forEach((flag) => {
                if (flag == "\\Seen") {
                  finalAttributes.seen = true;
                } else if (flag == "\\Flagged") {
                  finalAttributes.starred = true;
                } else if (flag == "\\Answered") {
                  finalAttributes.answered = true;
                }
              });
              finalAttributes.date = attributes.date;
              if (bodyParsed) {
                finalMessages.push(finalAttributes);
                if (finalMessages.length == messages.length) {
                  finalMessages.sort((a, b) => {
                    return messages.indexOf(a.id) - messages.indexOf(b.id);
                  });
                  const realFinalMessages = finalMessages
                    .filter((msg) => {
                      return replyIds.indexOf(msg.messageId) == -1;
                    })
                    .map((msg) => {
                      msg.messageId = undefined;
                      return msg;
                    });
                  callback(null, realFinalMessages);
                }
              }
              attributesSet = true;
            });
          });
          imapFetch.on("error", (err) => {
            callback(err);
          });
        });
      }
    };
    callback(null, receiveObject);
  });

  imap.once("error", (err) => {
    callback(err);
  });

  imap.connect();
};
