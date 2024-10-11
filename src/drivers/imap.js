const Imap = require("imap");

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
      }
    };
    callback(null, receiveObject);
  });

  imap.once("error", (err) => {
    callback(err);
  });

  imap.connect();
};
