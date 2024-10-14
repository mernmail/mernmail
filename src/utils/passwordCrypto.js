const crypto = require("crypto");

// Decode the base64 strings to buffers
const secretKey = Buffer.from(process.env.ENCRYPTION_SECRETKEY, "base64");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "base64");

// Encrypt the password
function encryptPassword(password) {
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt the password
function decryptPassword(encryptedPassword) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encryptPassword: encryptPassword,
  decryptPassword: decryptPassword
};
