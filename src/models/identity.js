const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  identity: {
    type: String,
    required: true
  },
  default: {
    type: Boolean,
    required: true
  }
});

const Identity = mongoose.model("identities", identitySchema);

module.exports = Identity;
