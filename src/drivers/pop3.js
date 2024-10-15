const Pop3Command = require("node-pop3");
const { simpleParser, MailParser } = require("mailparser");
const sha256 = require("../utils/sha256.js");
const { saveAttachment } = require("../utils/attachments.js");

module.exports = function init(email, password, callback) {
  const pop3 = new Pop3Command({
    host: process.env.EMAIL_RECV_HOST,
    port: process.env.EMAIL_RECV_PORT,
    tls: parseInt(process.env.EMAIL_RECV_TLS) > 0
  });

  pop3
    .connect()
    .then(() => {
      pop3
        .command("USER", email)
        .then(() => {
          pop3
            .command("PASS", password)
            .then(() => {
              const receiveObject = {
                capabilities: {
                  markAsUnread: false,
                  star: false,
                  multipleMailboxes: false
                },
                close: () => {
                  pop3.command("QUIT");
                },
                getMailboxes: (callback) => {
                  // POP3 supports only one mailbox.
                  callback(null, [
                    {
                      id: "Inbox",
                      name: "Inbox",
                      type: "inbox",
                      openable: true,
                      level: 0,
                      new: 0
                    }
                  ]);
                },
                openMailbox: (mailbox, callback) => {
                  // POP3 supports only one mailbox.
                  if (mailbox == "Inbox") {
                    callback(null);
                  } else {
                    callback(new Error("The mailbox doesn't exist"));
                  }
                },
                getAllMessages: (callback) => {
                  pop3
                    .command("LIST")
                    .then((listArray) => {
                      const listInfo = listArray[0];
                      const listified = Pop3Command.listify(listInfo);
                      const finalMessages = [];
                      const replyIds = [];
                      const getMessageContents = (callback2, _id) => {
                        if (!_id) _id = 0;
                        if (_id >= listified.length) {
                          callback2();
                          return;
                        }
                        pop3
                          .TOP(parseInt(listified[_id][0]), 0)
                          .then((header) => {
                            const finalAttributes = {
                              seen: true,
                              starred: false,
                              answered: false,
                              date: new Date(),
                              id: parseInt(listified[_id][0]),
                              subject: "Unknown email",
                              from: "Unknown",
                              to: "Unknown",
                              messageId: null
                            };
                            simpleParser(header)
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
                                  parsed.to && parsed.to.value
                                    ? parsed.to.value || []
                                    : [];
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
                                if (parsed.inReplyTo)
                                  replyIds.push(parsed.inReplyTo);
                                finalMessages.push(finalAttributes);
                                getMessageContents(callback2, _id + 1);
                              })
                              .catch(() => {
                                getMessageContents(callback2, _id + 1);
                              });
                          })
                          .catch((err) => {
                            callback(err);
                          });
                      };
                      getMessageContents(() => {
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
                      });
                    })
                    .catch((err) => {
                      callback(err);
                    });
                },
                getMessage: (message, user, callback) => {
                  const messageId = parseInt(message);
                  if (isNaN(messageId)) {
                    callback(new Error("Message ID parse error"));
                    return;
                  }
                  const messages = [];
                  pop3
                    .command("RETR", messageId)
                    .then((retrObject) => {
                      const retrStream = retrObject[1];
                      const finalAttributes = {
                        seen: true,
                        starred: false,
                        answered: false,
                        date: new Date(),
                        id: message,
                        subject: "Unknown email",
                        from: [
                          { name: "Unknown", address: "unknown@example.com" }
                        ],
                        to: [
                          { name: "Unknown", address: "unknown@example.com" }
                        ],
                        body: "",
                        attachments: []
                      };
                      let messageDate = null;

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
                              ? {
                                  name: fromObject.name,
                                  address: fromObject.address
                                }
                              : {
                                  name: "Unknown",
                                  address: "unknown@example.com"
                                }
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
                              ? {
                                  name: toObject.name,
                                  address: toObject.address
                                }
                              : {
                                  name: "Unknown",
                                  address: "unknown@example.com"
                                }
                          );
                        });
                        finalAttributes.to = to;
                        finalAttributes.subject = headers.get("subject");
                        messageDate = headers.get("date");
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
                              stringifiedHeaders = JSON.stringify([
                                ...data.headers
                              ]);
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
                        messages.unshift(finalAttributes);
                        callback(null, messages);
                      });
                      retrStream.pipe(parser);
                    })
                    .catch((err) => {
                      callback(err);
                    });
                },
                markMessageAsUnread: (message, callback) => {
                  callback(new Error("POP3 doesn't support read/unread flags"));
                }
              };
              callback(null, receiveObject);
            })
            .catch((err) => {
              callback(err);
            });
        })
        .catch((err) => {
          callback(err);
        });
    })
    .catch((err) => {
      callback(err);
    });
};
