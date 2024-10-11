const nodemailer = require("nodemailer");

module.exports = function init(email, password, callback) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SEND_HOST,
    port: process.env.EMAIL_SEND_PORT,
    secure: parseInt(process.env.EMAIL_SEND_TLS) > 0,
    auth: {
      user: email,
      pass: password
    }
  });

  transporter.verify((error, success) => {
    if (success) {
      const sendObject = {
        close: () => {
          transporter.close();
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
