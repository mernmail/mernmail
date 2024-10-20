import LoginForm from "@/layouts/LoginForm.jsx";
import Loading from "@/layouts/Loading.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "@/slices/authSlice.js";
import { useEffect } from "react";

let firstTime = true;
let oldAllMessages = [];

function App() {
  const loading = useSelector((state) => state.auth.loading);
  const email = useSelector((state) => state.auth.email);
  const dispatch = useDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(checkAuth);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [dispatch]);

  useEffect(() => {
    const getNewMessages = async () => {
      try {
        if (window.Notification.permission == "granted") {
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
                  if (
                    message.mailboxType == "spam" ||
                    message.mailboxType == "sent" ||
                    message.mailboxType == "trash" ||
                    message.mailboxType == "important" ||
                    message.mailboxType == "starred"
                  )
                    return false;
                  return !oldAllMessages.find(
                    (oldMessage) => oldMessage.messageId == message.messageId
                  );
                  // eslint-disable-next-line no-unused-vars
                } catch (err) {
                  return false;
                }
              });
              oldAllMessages = allMessages;
              newMessages.forEach((message) => {
                try {
                  if (window.Notification.permission == "granted") {
                    const notification = new window.Notification(
                      "New email message",
                      {
                        body: `From: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}`,
                        icon: "/icon.png"
                      }
                    );
                    notification.addEventListener("click", (event) => {
                      event.preventDefault();
                      window.open(
                        document.location.origin +
                          document.location.pathname +
                          `#message/${message.id}`,
                        "_blank"
                      );
                    });
                  }
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
    };

    getNewMessages();

    const interval = setInterval(async () => {
      await getNewMessages();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <Loading />;
  } else if (email === null) {
    return <LoginForm />;
  } else {
    return <MainLayout />;
  }
}

export default App;
