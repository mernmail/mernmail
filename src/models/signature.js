const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  signature: {
    type: String,
    required: true
  }
});

const Signature = mongoose.model("signatures", signatureSchema);

module.exports = Signature;
