const fs = require("fs");
const path = require("path");
const attachmentsPath = process.env.ATTACHMENTS_PATH;

function saveAttachment(attachmentHash, attachmentStream, user, callback) {
  const sanitizedAttachmentHash = attachmentHash
    .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
    .replace(/^[/\\]+/g, "")
    .replace(/[/\\]+$/g, "");
  const userAttachmentDirectory = path.join(
    attachmentsPath,
    user.replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "").replace(/[/\\]+/g, "")
  );
  fs.mkdir(userAttachmentDirectory, (err) => {
    if (err && err.code != "EEXIST") {
      callback(err);
      return;
    }
    const pathToTheAttachment = path.join(
      userAttachmentDirectory,
      sanitizedAttachmentHash
    );
    fs.access(pathToTheAttachment, fs.constants.F_OK, (err) => {
      if (err) {
        if (err.code == "ENOENT") {
          try {
            const fileStream = fs.createWriteStream(pathToTheAttachment);
            fileStream.on("close", () => {
              callback(null, sanitizedAttachmentHash);
            });
            fileStream.on("error", () => {
              callback(err);
            });
            attachmentStream.pipe(fileStream);
          } catch (err) {
            callback(err);
          }
        } else {
          callback(err);
        }
      } else {
        callback(null, sanitizedAttachmentHash);
      }
    });
  });
}

module.exports = {
  saveAttachment: saveAttachment
};
