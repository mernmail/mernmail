function getNewMessages() {
    if(self.Notification.permission == "granted") {
        self.registration.showNotification("New email message", { body: "From: a\nTo: b\nSubject: test", icon: "/icon.png"});
    }
}

self.addEventListener('activate', async () => {
  setInterval(() => {
    getNewMessages();
  }, 10000);

  getNewMessages();
});