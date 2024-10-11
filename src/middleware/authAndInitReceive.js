const initReceiveDriver = require("../utils/initReceiveDriver.js");

module.exports = function authAndInitReceiveMiddleware(req, res, next) {
  // Custom implementation of HTTP Basic authentication
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const authPair = Buffer.from(b64auth, "base64").toString().split(":");
  const email = authPair[0];
  const password = authPair[1];

  const deny = (message) => {
    res.set("WWW-Authenticate", "Basic");
    res.status(401).json({ message: message || "Authentication required." });
  };

  if (email && password) {
    initReceiveDriver(email, password, (err, driver) => {
      if (err) {
        deny(err.message);
      } else {
        req.credentials = {
          email: email,
          password: password
        };
        req.receiveDriver = driver;
        next();
      }
    });
  } else {
    deny();
  }
};
