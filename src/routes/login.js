const express = require("express");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.js");
const initReceiveDriver = require("../utils/initReceiveDriver.js");
const { encryptPassword } = require("../utils/passwordCrypto.js");

const router = express.Router();

router.post("/", (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  initReceiveDriver(
    String(req.body.email),
    String(req.body.password),
    (err, driver) => {
      if (err) {
        res.status(401).json({ message: err.message });
      } else {
        driver.close();
        userModel
          .findOne({ email: req.body.email })
          .then((result) => {
            const createCallback = () => {
              jwt.sign(
                { email: req.body.email },
                process.env.JWT_SECRET,
                (err, token) => {
                  if (err) {
                    res.status(401).json({ message: err.message });
                  } else {
                    res.cookie("token", token, {
                      maxAge: 315360000000,
                      httpOnly: true,
                      secure: parseInt(process.env.JWT_SECURECOOKIE) > 0,
                      sameSite: "strict"
                    });
                    res.json({ message: "Logged in successfully" });
                  }
                }
              );
            };
            const encryptedPassword = encryptPassword(req.body.password);
            if (!result) {
              userModel
                .create({
                  email: req.body.email,
                  encryptedPassword: encryptedPassword
                })
                .then(createCallback)
                .catch((err) => {
                  res.status(500).json({ message: err.message });
                });
            } else {
              userModel
                .replaceOne(
                  { email: req.body.email },
                  {
                    email: req.body.email,
                    encryptedPassword: encryptedPassword
                  }
                )
                .then(createCallback)
                .catch((err) => {
                  res.status(500).json({ message: err.message });
                });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: err.message });
          });
      }
    }
  );
});

module.exports = router;
