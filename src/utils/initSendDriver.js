const smtpInit = require("../drivers/smtp.js");

module.exports = function init(email, password, callback) {
  if (process.env.EMAIL_SEND_PROTOCOL == "smtp") {
    return smtpInit(email, password, callback);
  } else {
    callback(new Error("Email sending protocol not supported."));
  }
};
