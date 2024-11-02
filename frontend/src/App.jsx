import LoginForm from "@/layouts/LoginForm.jsx";
import Loading from "@/layouts/Loading.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "@/slices/authSlice.js";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

let firstTime = true;
let oldAllMessages = [];

function App() {
  const { t } = useTranslation();
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
                    message.mailboxType == "drafts" ||
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
                      t("newmessage"),
                      {
                        body: `${t("from", { from: message.from })}\n${t("to", { to: message.to })}${message.cc ? "\n" + t("cc", { cc: message.cc }) : ""}\n${t("subject", { subject: message.subject ? message.subject : t("nosubject") })}`,
                        icon: "/icon.png"
                      }
                    );
                    notification.addEventListener("click", (event) => {
                      event.preventDefault();
                      window.open(
                        `${document.location.origin}${document.location.pathname}#message/${message.id}`,
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

    if (email !== null) {
      getNewMessages();

      const interval = setInterval(async () => {
        await getNewMessages();
      }, 10000);
      return () => {
        clearInterval(interval);
      };
    } else {
      firstTime = true;
      oldAllMessages = [];
    }
  }, [email, t]);

  if (loading) {
    return <Loading />;
  } else if (email === null) {
    return <LoginForm />;
  } else {
    return <MainLayout />;
  }
}

export default App;
