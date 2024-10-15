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
    fs.stat(pathToTheAttachment, (err, stats) => {
      if (err) {
        if (err.code == "ENOENT") {
          try {
            const fileStream = fs.createWriteStream(pathToTheAttachment);
            fileStream.on("finish", () => {
              fs.stat(pathToTheAttachment, (err, stats) => {
                if (err) {
                  callback(err);
                } else {
                  callback(null, sanitizedAttachmentHash, stats.size);
                }
              });
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
        callback(null, sanitizedAttachmentHash, stats.size);
      }
    });
  });
}

function getAttachment(attachmentHash, user, callback) {
  const sanitizedAttachmentHash = attachmentHash
    .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
    .replace(/^[/\\]+/g, "")
    .replace(/[/\\]+$/g, "");
  const pathToTheAttachment = path.join(
    attachmentsPath,
    user.replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "").replace(/[/\\]+/g, ""),
    sanitizedAttachmentHash
  );
  const readStream = fs.createReadStream(pathToTheAttachment);
  readStream.on("open", () => {
    callback(null, readStream);
  });
  readStream.on("error", (err) => {
    callback(err);
  });
}

module.exports = {
  saveAttachment: saveAttachment,
  getAttachment: getAttachment
};
