import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import { setMessages, resetLoading } from "@/slices/messagesSlice.js";

function EmailContent() {
  const { t } = useTranslation();
  const mailboxId = useSelector((state) => state.mailboxes.currentMailbox);
  const messages = useSelector((state) => state.messages.messages);
  const loading = useSelector((state) => state.messages.loading);
  const mailboxesLoading = useSelector((state) => state.mailboxes.loading);
  const dispatch = useDispatch();
  const titleSelected = useSelector(
    (state) => state.mailboxes.currentMailboxName
  );
  const type = useSelector((state) => state.mailboxes.currentMailboxType);
  let title = "";
  if (type == "inbox") {
    title = t("inbox");
  } else if (type == "starred") {
    title = t("starred");
  } else if (type == "important") {
    title = t("important");
  } else if (type == "sent") {
    title = t("sent");
  } else if (type == "drafts") {
    title = t("drafts");
  } else if (type == "all") {
    title = t("all");
  } else if (type == "spam") {
    title = t("spam");
  } else if (type == "trash") {
    title = t("trash");
  } else {
    title = titleSelected;
  }

  useEffect(() => {
    if (!mailboxesLoading) {
      dispatch(resetLoading());
      dispatch(setMessages);

      const interval = setInterval(() => {
        dispatch(setMessages);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [mailboxesLoading, mailboxId]);

  if (loading) {
    return <p className="text-center">{t("loading")}</p>;
  } else {
    return (
      <>
        <div className="flex flex-col md:flex-row mt-2 mb-2">
          <h1 className="text-3xl md:text-4xl mb-1 md:mb-0 font-bold content-center whitespace-nowrap grow overflow-hidden text-ellipsis">
            {title}
          </h1>
          <p className="md:text-xl text-foreground/50 content-center whitespace-nowrap shrink-0">
            {messages.length}{" "}
            {t(messages.length == 1 ? "1message" : "nummessages")}
          </p>
        </div>
        <ul className="mx-0.5 list-none">
          <li className="inline-block mx-0.5">
            <input
              type="checkbox"
              className="w-6 h-6 inline-block m-1 align-middle"
              title={t("selectall")}
            />
          </li>
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              title={t("refresh")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <RefreshCw
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              title={t("search")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <Search
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
        </ul>
      </>
    );
  }
}

export default EmailContent;
