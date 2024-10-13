import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Search, Star } from "lucide-react";
import { useEffect } from "react";
import { setMessages, resetLoading } from "@/slices/messagesSlice.js";

function EmailContent() {
  const { t } = useTranslation();
  const mailboxId = useSelector((state) => state.mailboxes.currentMailbox);
  const messages = useSelector((state) => state.messages.messages);
  const loading = useSelector((state) => state.messages.loading);
  const error = useSelector((state) => state.messages.error);
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
  }, [mailboxesLoading, mailboxId, dispatch]);

  if (loading) {
    return <p className="text-center">{t("loading")}</p>;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">
        {t("cantloadmailbox", { error: error })}
      </p>
    );
  } else {
    return (
      <>
        <div className="flex flex-col md:flex-row mt-2 mb-2">
          <h1 className="text-3xl md:text-4xl mb-1 md:mb-0 font-bold content-center whitespace-nowrap grow overflow-hidden text-ellipsis">
            {title}
          </h1>
          <p className="md:text-xl text-foreground/50 content-center whitespace-nowrap shrink-0">
            {t(messages.length == 1 ? "1message" : "nummessages", {
              count: messages.length
            })}
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
                dispatch(setMessages);
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
        <ul className="list-none border-border border-t-2">
          <li className="block border-border border-b-2 px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5">
            <div className="flex flex-col md:flex-row">
              <div className="shrink-0">
                <input
                  type="checkbox"
                  className="w-6 h-6 mx-1.5 my-1 inline-block align-middle"
                  title={t("select")}
                />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  title={t("star")}
                  className="inline-block align-middle shrink-0 w-8 h-8 p-1 mx-0.5 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                >
                  <Star
                    width={24}
                    height={24}
                    className="inline w-6 h-6 align-top"
                  />
                </a>
              </div>
              <p className="whitespace-nowrap font-bold overflow-hidden text-ellipsis md:self-center px-1">
                John Smith
              </p>
              <p className="whitespace-nowrap grow md:self-center px-1 overflow-hidden text-ellipsis">
                The example message
              </p>
              <p className="whitespace-nowrap px-1 md:self-center">
                {t("datetime", {
                  val: new Date(),
                  formatParams: {
                    val: {
                      day: "numeric",
                      year: "numeric",
                      month: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    }
                  }
                })}
              </p>
            </div>
          </li>
        </ul>
      </>
    );
  }
}

export default EmailContent;
