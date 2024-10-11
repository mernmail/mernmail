const Pop3Command = require("node-pop3");

module.exports = function init(email, password, callback) {
  const pop3 = new Pop3Command({
    user: email,
    password: password,
    host: process.env.EMAIL_RECV_HOST,
    port: process.env.EMAIL_RECV_PORT,
    tls: parseInt(process.env.EMAIL_RECV_TLS) > 0
  });

  pop3
    .connect()
    .then(() => {
      const receiveObject = {
        close: () => {
          pop3.command("QUIT");
        }
      };
      callback(null, receiveObject);
    })
    .catch((err) => {
      callback(err);
    });
};
