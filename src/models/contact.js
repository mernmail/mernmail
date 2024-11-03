const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  emailAddress: {
    type: String
  },
  address: {
    type: String
  },
  phoneNumber: {
    type: String
  }
});

const Contact = mongoose.model("contacts", contactSchema);

module.exports = Contact;
