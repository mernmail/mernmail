const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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

const Identity = mongoose.model("identities", userSchema);

module.exports = Identity;
