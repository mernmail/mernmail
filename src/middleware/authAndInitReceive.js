const initReceiveDriver = require("../utils/initReceiveDriver.js");
const { decryptPassword } = require("../utils/passwordCrypto.js");
const userModel = require("../models/user.js");
const jwt = require("jsonwebtoken");

module.exports = function authAndInitReceiveMiddleware(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: err.message });
      return;
    }
    const email = decoded.email;
    userModel
      .findOne({ email: email })
      .then((result) => {
        if (!result) {
          res.status(401).json({ message: "User not found" });
        } else {
          const password = decryptPassword(result.encryptedPassword);
          initReceiveDriver(email, password, (err, driver) => {
            if (err) {
              try {
                res.status(401).json({ message: err.message });
                // eslint-disable-next-line no-unused-vars
              } catch (err) {
                // Header are probably already sent
              }
            } else {
              req.credentials = {
                email: email,
                password: password
              };
              req.receiveDriver = driver;
              next();
            }
          });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  });
};
