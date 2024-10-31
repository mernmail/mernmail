const nodemailer = require("nodemailer");
const { htmlToText } = require("html-to-text");
const MailComposer = require("nodemailer/lib/mail-composer");

module.exports = function init(email, password, callback) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SEND_HOST,
    port: process.env.EMAIL_SEND_PORT,
    secure: parseInt(process.env.EMAIL_SEND_TLS) > 0,
    auth: {
      user: email,
      pass: password
    },
    tls: {
      rejectUnauthorized: !(
        parseInt(process.env.EMAIL_SEND_ALLOWBADCERTIFICATES) > 0
      )
    }
  });

  transporter.verify((error, success) => {
    if (success) {
      const sendObject = {
        close: () => {
          transporter.close();
        },
        compose: (message, callback) => {
          try {
            const messageObj = {
              from: message.from,
              to: message.to,
              cc: message.cc,
              bcc: message.bcc,
              subject: message.subject,
              inReplyTo: message.inReplyTo,
              html: message.content,
              text: htmlToText(message.contents).replace(
                /(\n)\[cid:[^[\]]*?\] |\[cid:[^[\]]*?\]/g,
                "$1"
              ),
              attachments: message.attachments
                ? message.attachments.map((attachment) => {
                    return {
                      filename: attachment.filename,
                      content: attachment.content,
                      contentType: attachment.contentType,
                      contentDisposition: attachment.inline
                        ? "inline"
                        : "attachment",
                      encoding: "base64",
                      cid: attachment.id
                    };
                  })
                : undefined
            };
            const mail = new MailComposer(messageObj).compile();
            mail.keepBcc = true;
            mail.build((err, contents) => {
              if (err) {
                callback(err);
              } else {
                callback(null, contents);
              }
            });
          } catch (err) {
            callback(err);
          }
        },
        send: (from, to, cc, bcc, messageBody, callback) => {
          try {
            const messageObj = {
              envelope: {
                from: from,
                to: to,
                cc: cc,
                bcc: bcc
              },
              raw: messageBody
            };
            transporter.sendMail(messageObj, (err) => {
              if (err) {
                callback(err);
              } else {
                callback(null);
              }
            });
          } catch (err) {
            callback(err);
          }
        }
      };
      callback(null, sendObject);
    } else if (error) {
      callback(error);
    } else {
      callback(new Error("Unknown error"));
    }
  });
};
