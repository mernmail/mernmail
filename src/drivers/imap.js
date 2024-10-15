const Imap = require("imap-node");
const { simpleParser, MailParser } = require("mailparser");
const sha256 = require("../utils/sha256.js");
const { saveAttachment } = require("../utils/attachments.js");

module.exports = function init(email, password, callback) {
  const imap = new Imap({
    user: email,
    password: password,
    host: process.env.EMAIL_RECV_HOST,
    port: process.env.EMAIL_RECV_PORT,
    tls: parseInt(process.env.EMAIL_RECV_TLS) > 0
  });

  imap.once("ready", () => {
    let currentMailbox = null;
    const receiveObject = {
      capabilities: {
        markAsUnread: true,
        star: true,
        multipleMailboxes: true
      },
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
            Object.keys(mailboxes)
              .reduce((acc, element) => {
                if (element == "INBOX") {
                  return [element, ...acc];
                }
                return [...acc, element];
              }, [])
              .forEach((mailboxName) => {
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
        imap.openBox(mailbox, (err, mailboxObj) => {
          if (err) {
            callback(err);
            return;
          }
          currentMailbox = mailboxObj;
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
          const replyIds = [];
          if (messages.length == 0) {
            callback(null, []);
            return;
          }
          const imapFetch = imap.fetch(messages, {
            bodies: "HEADER.FIELDS (FROM TO SUBJECT MESSAGE-ID IN-REPLY-TO)"
          });
          imapFetch.on("message", (msg) => {
            let attributesSet = false;
            let bodyParsed = false;
            const finalAttributes = {
              seen: false,
              starred: false,
              answered: false,
              date: new Date(),
              id: -1,
              subject: "Unknown email",
              from: "Unknown",
              to: "Unknown",
              otherIds: [],
              messageId: null
            };

            msg.on("body", (bodyStream) => {
              simpleParser(bodyStream)
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
                  if (parsed.inReplyTo) {
                    for (let i = 0; i < finalMessages.length; i++) {
                      if (finalMessages[i].messageId == parsed.inReplyTo) {
                        finalAttributes.otherIds = [
                          ...finalMessages[i].otherIds,
                          finalMessages[i].id
                        ];
                        break;
                      }
                    }
                    replyIds.push(parsed.inReplyTo);
                  }
                  if (attributesSet) {
                    finalMessages.push(finalAttributes);
                    if (finalMessages.length == messages.length) {
                      finalMessages.sort((a, b) => {
                        return messages.indexOf(a.id) - messages.indexOf(b.id);
                      });
                      finalMessages.sort((a, b) => {
                        return a.date - b.date;
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
              finalAttributes.id = attributes.uid;
              finalAttributes.date = attributes.date;
              if (bodyParsed) {
                finalMessages.push(finalAttributes);
                if (finalMessages.length == messages.length) {
                  finalMessages.sort((a, b) => {
                    return messages.indexOf(a.id) - messages.indexOf(b.id);
                  });
                  finalMessages.sort((a, b) => {
                    return a.date - b.date;
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
      },
      getMessage: (message, user, callback) => {
        const fMessageId = parseInt(message);
        if (isNaN(fMessageId)) {
          callback(new Error("Message ID parse error"));
          return;
        }
        const messages = [];
        const findReply = (replyId, callback2) => {
          imap.search([["HEADER", "MESSAGE-ID", replyId]], (err, messages) => {
            if (err) {
              callback2(false);
              return;
            }
            if (messages.length > 0) {
              callback2(messages[0]);
            } else {
              callback2(false);
            }
          });
        };
        const getOneMessage = (messageId, callback2) => {
          imap.addFlags(messageId, ["\\Seen"], () => {
            let hasMessage = false;
            const imapFetch = imap.fetch(messageId, {
              bodies: ""
            });
            imapFetch.on("message", (msg) => {
              hasMessage = true;
              let attributesSet = false;
              let bodyParsed = false;
              const finalAttributes = {
                seen: false,
                starred: false,
                answered: false,
                date: new Date(),
                id: -1,
                subject: "Unknown email",
                from: [{ name: "Unknown", address: "unknown@example.com" }],
                to: [{ name: "Unknown", address: "unknown@example.com" }],
                body: "",
                attachments: []
              };
              let messageDate = null;
              let replyTo = null;

              msg.on("body", (bodyStream) => {
                const parser = new MailParser();
                parser.on("headers", (headers) => {
                  const fromArray =
                    headers.get("from") && headers.get("from").value
                      ? headers.get("from").value || []
                      : [];
                  const from = [];
                  fromArray.forEach((fromObject) => {
                    from.push(
                      fromObject
                        ? { name: fromObject.name, address: fromObject.address }
                        : { name: "Unknown", address: "unknown@example.com" }
                    );
                  });
                  finalAttributes.from = from;
                  const toArray =
                    headers.get("to") && headers.get("to").value
                      ? headers.get("to").value || []
                      : [];
                  const to = [];
                  toArray.forEach((toObject) => {
                    to.push(
                      toObject
                        ? { name: toObject.name, address: toObject.address }
                        : { name: "Unknown", address: "unknown@example.com" }
                    );
                  });
                  finalAttributes.to = to;
                  finalAttributes.subject = headers.get("subject");
                  messageDate = headers.get("date");
                  replyTo = headers.get("in-reply-to");
                });
                parser.on("data", (data) => {
                  if (data.type === "text") {
                    if (data.html) {
                      finalAttributes.body = data.html;
                    } else {
                      finalAttributes.body = `<!DOCTYPE html><html><head></head><body><pre>${String(data.text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
                    }
                  } else if (data.type === "attachment") {
                    let stringifiedHeaders = null;
                    try {
                      if (data.headers)
                        stringifiedHeaders = JSON.stringify([...data.headers]);
                      // eslint-disable-next-line no-unused-vars
                    } catch (err) {
                      // Don't stringify headers
                    }
                    const attachmentHash = sha256(
                      String(data.checksum) +
                        String(data.contentId) +
                        String(finalAttributes.attachments.length) +
                        String(messageDate) +
                        String(stringifiedHeaders)
                    );
                    saveAttachment(
                      attachmentHash,
                      data.content,
                      user,
                      (err, attachmentId, size) => {
                        if (!err) {
                          finalAttributes.attachments.push({
                            filename: data.filename || attachmentId,
                            contentType: data.contentType,
                            contentDisposition: data.contentDisposition,
                            contentId: data.cid,
                            size: size,
                            id: attachmentId
                          });
                        }
                        data.release();
                      }
                    );
                  }
                });
                parser.on("end", () => {
                  if (attributesSet) {
                    messages.unshift(finalAttributes);
                    if (replyTo) {
                      findReply(replyTo, (message) => {
                        if (!message) {
                          callback2();
                        } else {
                          getOneMessage(message, callback2);
                        }
                      });
                    } else {
                      callback2();
                    }
                  }
                  bodyParsed = true;
                });
                bodyStream.pipe(parser);
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
                finalAttributes.id = attributes.uid;
                if (bodyParsed) {
                  messages.unshift(finalAttributes);
                  if (replyTo) {
                    findReply(replyTo, (message) => {
                      if (!message) {
                        callback2();
                      } else {
                        getOneMessage(message, callback2);
                      }
                    });
                  } else {
                    callback2();
                  }
                }
                attributesSet = true;
              });
            });
            imapFetch.on("error", (err) => {
              callback(err);
            });
            imapFetch.on("end", () => {
              if (!hasMessage) {
                if (messageId == fMessageId)
                  callback(new Error("The message doesn't exist"));
                else callback2();
              }
            });
          });
        };
        getOneMessage(fMessageId, () => {
          callback(null, messages);
        });
      },
      markMessagesAsUnread: (messages, callback) => {
        imap.delFlags(messages, ["\\Seen"], (err) => {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      },
      markMessagesAsRead: (messages, callback) => {
        imap.addFlags(messages, ["\\Seen"], (err) => {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      },
      findSpamMailbox: (callback) => {
        imap.getBoxes((err, mailboxes) => {
          if (err) {
            callback(err);
            return;
          }

          const findSpamMailbox = (mailboxes) => {
            return Object.keys(mailboxes).reduce((result, mailboxName) => {
              const mailbox = mailboxes[mailboxName];
              if (
                mailbox.attribs.indexOf("\\NOSELECT") == -1 &&
                mailbox.attribs.indexOf("\\Junk") != -1
              ) {
                return mailboxName;
              }
              if (mailbox.children) {
                const childResult = findSpamMailbox(mailbox.children);
                if (childResult) {
                  return `${mailboxName}${mailbox.delimiter}${childResult}`;
                }
              }
              return result;
            }, null);
          };

          callback(null, findSpamMailbox(mailboxes));
        });
      },
      moveMessages: (messages, newMailbox, callback) => {
        try {
          imap.move(messages, newMailbox, (err) => {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        } catch (err) {
          callback(err);
        }
      },
      deleteMessages: (messages, callback) => {
        imap.getBoxes((err, mailboxes) => {
          if (err) {
            callback(err);
            return;
          }

          const findSpamMailbox = (mailboxes) => {
            return Object.keys(mailboxes).reduce((result, mailboxName) => {
              const mailbox = mailboxes[mailboxName];
              if (
                mailbox.attribs.indexOf("\\NOSELECT") == -1 &&
                mailbox.attribs.indexOf("\\Junk") != -1
              ) {
                return mailboxName;
              }
              if (mailbox.children) {
                const childResult = findSpamMailbox(mailbox.children);
                if (childResult) {
                  return `${mailboxName}${mailbox.delimiter}${childResult}`;
                }
              }
              return result;
            }, null);
          };

          const findTrashMailbox = (mailboxes) => {
            return Object.keys(mailboxes).reduce((result, mailboxName) => {
              const mailbox = mailboxes[mailboxName];
              if (
                mailbox.attribs.indexOf("\\NOSELECT") == -1 &&
                mailbox.attribs.indexOf("\\Trash") != -1
              ) {
                return mailboxName;
              }
              if (mailbox.children) {
                const childResult = findSpamMailbox(mailbox.children);
                if (childResult) {
                  return `${mailboxName}${mailbox.delimiter}${childResult}`;
                }
              }
              return result;
            }, null);
          };

          const trashMailbox = findTrashMailbox(mailboxes);
          const spamMailbox = findSpamMailbox(mailboxes);

          if (
            !trashMailbox ||
            currentMailbox.name == spamMailbox ||
            currentMailbox.name == trashMailbox
          ) {
            try {
              imap.addFlags(messages, ["\\Deleted"], (err) => {
                if (err) {
                  callback(err);
                } else {
                  try {
                    imap.expunge((err) => {
                      if (err) {
                        callback(err);
                      } else {
                        callback(null, null);
                      }
                    });
                  } catch (err) {
                    callback(err);
                  }
                }
              });
            } catch (err) {
              callback(err);
            }
          } else {
            try {
              imap.move(messages, trashMailbox, (err) => {
                if (err) {
                  callback(err);
                } else {
                  callback(null, trashMailbox);
                }
              });
            } catch (err) {
              callback(err);
            }
          }
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
