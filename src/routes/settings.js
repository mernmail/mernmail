const identityModel = require("../models/identity.js");
const signatureModel = require("../models/signature.js");
const express = require("express");
const router = express.Router();

router.get("/identities", (req, res) => {
  identityModel
    .find({ email: req.credentials.email })
    .then((results) => {
      if (results.length == 0) {
        identityModel
          .create({
            email: req.credentials.email,
            identity: req.credentials.email,
            default: true
          })
          .then(() => {
            identityModel
              .find({ email: req.credentials.email })
              .then((results) => {
                res.json({
                  identities: results.map((result) => ({
                    id: result.id,
                    identity: result.identity,
                    default: result.default
                  }))
                });
                req.receiveDriver.close();
              })
              .catch((err) => {
                res.status(500).json({ message: err.message });
                req.receiveDriver.close();
              });
          })
          .catch((err) => {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
          });
      } else {
        res.json({
          identities: results.map((result) => ({
            id: result.id,
            identity: result.identity,
            default: result.default
          }))
        });
        req.receiveDriver.close();
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/identity", (req, res) => {
  if (!req.body || !req.body.identity) {
    res.status(400).json({ message: "You need to provide an identity" });
    req.receiveDriver.close();
    return;
  }
  identityModel
    .create({
      email: req.credentials.email,
      identity: req.body.identity,
      default: false
    })
    .then(() => {
      res.json({ message: "Identity created successfully" });
      req.receiveDriver.close();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/identity/:id", (req, res) => {
  if (!req.body || !req.body.identity) {
    res.status(400).json({ message: "You need to provide an identity" });
    req.receiveDriver.close();
    return;
  }
  identityModel
    .findOne({ _id: req.params.id, email: req.credentials.email })
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: "The identity doesn't exist" });
        req.receiveDriver.close();
        return;
      }
      identityModel
        .updateOne(
          {
            _id: req.params.id,
            email: req.credentials.email
          },
          {
            identity: req.body.identity
          }
        )
        .then(() => {
          res.json({ message: "Identity updated successfully" });
          req.receiveDriver.close();
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/identity/:id/default", (req, res) => {
  identityModel
    .findOne({ _id: req.params.id, email: req.credentials.email })
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: "The identity doesn't exist" });
        req.receiveDriver.close();
        return;
      }
      identityModel
        .updateMany(
          {
            email: req.credentials.email
          },
          {
            default: false
          }
        )
        .then(() => {
          identityModel
            .updateOne(
              {
                _id: req.params.id,
                email: req.credentials.email
              },
              {
                default: true
              }
            )
            .then(() => {
              res.json({ message: "Identity updated successfully" });
              req.receiveDriver.close();
            })
            .catch((err) => {
              res.status(500).json({ message: err.message });
              req.receiveDriver.close();
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.delete("/identity/:id", (req, res) => {
  identityModel
    .findOne({ _id: req.params.id, email: req.credentials.email })
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: "The identity doesn't exist" });
        req.receiveDriver.close();
        return;
      } else if (result.default) {
        res.status(403).json({ message: "Cannot delete the default identity" });
        req.receiveDriver.close();
        return;
      }
      identityModel
        .deleteOne(
          {
            _id: req.params.id,
            email: req.credentials.email
          },
          {
            identity: req.body.identity
          }
        )
        .then(() => {
          res.json({ message: "Identity deleted successfully" });
          req.receiveDriver.close();
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
          req.receiveDriver.close();
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.get("/signature", (req, res) => {
  signatureModel
    .findOne({ email: req.credentials.email })
    .then((result) => {
      if (!result) {
        signatureModel
          .create({
            email: req.credentials.email,
            signature: "<p>Sent with <strong>MERNMail</strong></p>"
          })
          .then(() => {
            signatureModel
              .findOne({ email: req.credentials.email })
              .then((result) => {
                res.json({
                  signature: result.signature
                });
                req.receiveDriver.close();
              })
              .catch((err) => {
                res.status(500).json({ message: err.message });
                req.receiveDriver.close();
              });
          })
          .catch((err) => {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
          });
      } else {
        res.json({
          signature: result.signature
        });
        req.receiveDriver.close();
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/signature", (req, res) => {
  if (!req.body || !req.body.signature) {
    res.status(400).json({ message: "You need to provide an signature" });
    req.receiveDriver.close();
    return;
  }
  signatureModel
    .findOne({ email: req.credentials.email })
    .then((result) => {
      const finalCallback = () => {
        res.json({ message: "Signature updated successfully" });
        req.receiveDriver.close();
      };
      if (!result) {
        signatureModel
          .create({
            email: req.credentials.email,
            signature: req.body.signature
          })
          .then(finalCallback)
          .catch((err) => {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
          });
      } else {
        signatureModel
          .updateOne(
            {
              email: req.credentials.email
            },
            {
              signature: req.body.signature
            }
          )
          .then(finalCallback)
          .catch((err) => {
            res.status(500).json({ message: err.message });
            req.receiveDriver.close();
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

module.exports = router;
