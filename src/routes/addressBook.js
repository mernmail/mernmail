const contactModel = require("../models/contact.js");
const express = require("express");
const router = express.Router();
const isEmail = require("validator/lib/isEmail");
const isMobilePhone = require("validator/lib/isMobilePhone").default;
const isURL = require("validator/lib/isURL");

router.get("/contacts", (req, res) => {
  contactModel
    .find({ email: req.credentials.email })
    .then((results) => {
      res.json({
        contacts: results.map((result) => ({
          id: result.id,
          name: result.name,
          email: result.emailAddress,
          address: result.address,
          phoneNumber: result.phoneNumber,
          website: result.website
        }))
      });
      req.receiveDriver.close();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/contact", (req, res) => {
  if (
    !req.body ||
    (req.body.email && !isEmail(req.body.email)) ||
    (req.body.phoneNumber &&
      !isMobilePhone(String(req.body.phoneNumber).replace(/ /g, ""))) ||
    (req.body.website &&
      !isURL(req.body.website, { protocols: ["http", "https"] }))
  ) {
    res.status(400).json({ message: "Invalid contact data" });
    req.receiveDriver.close();
    return;
  }
  contactModel
    .create({
      email: req.credentials.email,
      name: req.body.name,
      emailAddress: req.body.email,
      address: req.body.address,
      phoneNumber: String(req.body.phoneNumber).replace(/ /g, ""),
      website: req.body.website
    })
    .then(() => {
      res.json({ message: "Contact created successfully" });
      req.receiveDriver.close();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

router.post("/contact/:id", (req, res) => {
  if (
    !req.body ||
    (req.body.email && !isEmail(req.body.email)) ||
    (req.body.phoneNumber &&
      !isMobilePhone(String(req.body.phoneNumber).replace(/ /g, ""))) ||
    (req.body.website &&
      !isURL(req.body.website, { protocols: ["http", "https"] }))
  ) {
    res.status(400).json({ message: "Invalid contact data" });
    req.receiveDriver.close();
    return;
  }
  contactModel
    .findOne({ _id: req.params.id, email: req.credentials.email })
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: "The contact doesn't exist" });
        req.receiveDriver.close();
        return;
      }
      contactModel
        .updateOne(
          {
            _id: req.params.id,
            email: req.credentials.email
          },
          {
            name: req.body.name,
            emailAddress: req.body.email,
            address: req.body.address,
            phoneNumber: String(req.body.phoneNumber).replace(/ /g, ""),
            website: req.body.website
          }
        )
        .then(() => {
          res.json({ message: "Contact updated successfully" });
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

router.delete("/contact/:id", (req, res) => {
  contactModel
    .findOne({ _id: req.params.id, email: req.credentials.email })
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: "The contact doesn't exist" });
        req.receiveDriver.close();
        return;
      }
      contactModel
        .deleteOne({
          _id: req.params.id,
          email: req.credentials.email
        })
        .then(() => {
          res.json({ message: "Contact deleted successfully" });
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

module.exports = router;
