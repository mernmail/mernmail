const Imap = require("imap-node");

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
          const recurseMailBoxes = (mailboxes, prefix) => {
            Object.keys(mailboxes).forEach((mailboxName) => {
              const currentPath =
                (prefix ? prefix + mailboxes[mailboxName].delimiter : "") +
                mailboxName;
              if (mailboxes[mailboxName].attribs.indexOf("\\NOSELECT") == -1) {
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
                  new: 0
                });
              }
            });
          };
          recurseMailBoxes(mailboxes, null);
          const getMailboxStatuses = (callback, _id) => {
            if (!_id) _id = 0;
            if (_id >= resultMailboxes.length) {
              callback();
              return;
            }
            imap.status(resultMailboxes[_id].id, (err, box) => {
              if (!err) {
                resultMailboxes[_id].new = box.messages.unseen;
              }
              getMailboxStatuses(callback, _id + 1);
            });
          };
          getMailboxStatuses(() => {
            callback(null, resultMailboxes);
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
