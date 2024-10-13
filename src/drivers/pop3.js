const Pop3Command = require("node-pop3");
const emailParser = require("mailparser").simpleParser;

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
                              seen: false,
                              starred: false,
                              answered: false,
                              date: new Date(),
                              id: parseInt(listified[_id][0]),
                              subject: "Unknown email",
                              from: "Unknown",
                              to: "Unknown",
                              messageId: null
                            };
                            emailParser(header)
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
