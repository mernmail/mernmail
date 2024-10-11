const pop3Init = require("../drivers/pop3.js");
const imapInit = require("../drivers/imap.js");

module.exports = function init(email, password, callback) {
  if (process.env.EMAIL_RECV_PROTOCOL == "imap") {
    return imapInit(email, password, callback);
  } else if (process.env.EMAIL_RECV_PROTOCOL == "pop3") {
    return pop3Init(email, password, callback);
  } else {
    callback(new Error("Email receiving protocol not supported."));
  }
};
