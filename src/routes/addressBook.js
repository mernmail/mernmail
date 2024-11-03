const contactModel = require("../models/contact.js");
const MiniSearch = require("minisearch");
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
      !isMobilePhone(String(req.body.phoneNumber).replace(/[ -()]/g, ""))) ||
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
      phoneNumber: String(req.body.phoneNumber).replace(/[ -()]/g, ""),
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
      !isMobilePhone(String(req.body.phoneNumber).replace(/[ -()]/g, ""))) ||
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
            phoneNumber: req.body.phoneNumber
              ? String(req.body.phoneNumber).replace(/[ -()]/g, "")
              : req.body.phoneNumber,
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

router.delete("/contacts", (req, res) => {
  if (
    !req.body ||
    !req.body.contacts ||
    (!Array.isArray(req.body.contacts) &&
      typeof req.body.contacts != "string") ||
    req.body.contacts.length === 0
  ) {
    res.status(400).json({ message: "You need to provide contacts to delete" });
    req.receiveDriver.close();
    return;
  }
  const contactsToDelete =
    typeof req.body.contacts == "string"
      ? [req.body.contacts]
      : [...req.body.contacts];
  const deleteMany = (callback, _id) => {
    if (!_id) _id = 0;
    if (_id >= contactsToDelete.length) {
      callback();
      return;
    }
    contactModel
      .findOne({ _id: contactsToDelete[_id], email: req.credentials.email })
      .then((result) => {
        if (!result) {
          deleteMany(callback, _id + 1);
          return;
        }
        contactModel
          .deleteOne({
            _id: contactsToDelete[_id],
            email: req.credentials.email
          })
          .then(() => {
            deleteMany(callback, _id + 1);
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
  };
  deleteMany(() => {
    res.json({ message: "Contacts deleted successfully" });
    req.receiveDriver.close();
  });
});

router.get("/search/:query*", (req, res) => {
  const query = req.params.query + req.params[0];
  contactModel
    .find({ email: req.credentials.email })
    .then((results) => {
      const contacts = results.map((result) => ({
        id: result.id,
        name: result.name,
        email: result.emailAddress,
        address: result.address,
        phoneNumber: result.phoneNumber,
        website: result.website
      }));
      var minisearch = new MiniSearch({
        fields: ["name", "email", "address", "phoneNumber", "website"],
        storeFields: [
          "id",
          "name",
          "email",
          "address",
          "phoneNumber",
          "website"
        ]
      });
      minisearch.addAll(contacts);
      res.json({
        results: minisearch.search(query)
      });
      req.receiveDriver.close();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
      req.receiveDriver.close();
    });
});

module.exports = router;
