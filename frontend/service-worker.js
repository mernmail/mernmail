let firstTime = true;
let oldAllMessages = [];

async function getNewMessages() {

    try {
    if(self.Notification.permission == "granted") {
        const res = await fetch("/api/receive/allmessages", {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();
        if (res.status == 200) {
          const allMessages = data.messages;
          if (!firstTime) {
          const newMessages = allMessages.filter((message) => {
            try {
            if (message.mailboxType == "spam" || message.mailboxType == "sent" || message.mailboxType == "trash" || message.mailboxType == "important" || message.mailboxType == "starred") return false;
            return !oldAllMessages.find((oldMessage) => oldMessage.messageId == message.messageId);
            // eslint-disable-next-line no-unused-vars
} catch (err) {
    return false;
}
          });
          oldAllMessages = allMessages;
          newMessages.forEach((message) => {
            try {
                if(self.Notification.permission == "granted") self.registration.showNotification("New email message", { body: `From: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}`, icon: "/icon.png"});
              // eslint-disable-next-line no-unused-vars
} catch (err) {
    // Don't send notification
}
          });
        } else {
            oldAllMessages = allMessages;
            firstTime = false;
        }
        }
        
    }
    // eslint-disable-next-line no-unused-vars
} catch (err) {
    // Don't send notification
}
}

self.addEventListener('activate', (event) => {
  event.waitUntil(getNewMessages());
});