import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Reply, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { setMessages, resetLoading } from "@/slices/messagesSlice.js";
import { setView } from "@/slices/viewSlice.js";

function EmailContent() {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
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
      const controller = AbortController ? new AbortController() : undefined;
      const signal = controller ? controller.signal : undefined;

      dispatch(resetLoading());
      dispatch(setMessages(signal));

      const interval = setInterval(() => {
        dispatch(setMessages(signal));
      }, 10000);

      return () => {
        if (controller) controller.abort();
        clearInterval(interval);
      };
    }
  }, [mailboxesLoading, mailboxId, dispatch]);

  useEffect(() => {
    if (refresh) {
      if (loading) {
        const controller = AbortController ? new AbortController() : undefined;
        const signal = controller ? controller.signal : undefined;

        dispatch(setMessages(signal));

        return () => {
          if (controller) controller.abort();
        };
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

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
                dispatch(resetLoading());
                setRefresh(true);
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
                dispatch(setView("search"));
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
        {messages.length > 0 ? (
          <ul className="list-none border-border border-t-2">
            {messages
              .slice()
              .reverse()
              .map((message) => {
                const subject = message.subject;
                const address = type == "sent" ? message.to : message.from;
                const date = new Date(message.date);
                const id = message.id;
                const starred = message.starred;
                const seen = message.seen;
                const answered = message.answered;
                return (
                  <li className="block border-border border-b-2" key={id}>
                    <div
                      onClick={() => {
                        // TODO: open a message
                        alert(`Message ${id} to open`);
                      }}
                      className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="shrink-0">
                          <input
                            type="checkbox"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="w-6 h-6 mx-1.5 my-1 inline-block align-middle"
                            title={t("select")}
                          />
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            title={t("star")}
                            className="inline-block align-middle shrink-0 w-8 h-8 p-1 mx-0.5 rounded-sm bg-inherit text-inherit hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                          >
                            <Star
                              width={24}
                              height={24}
                              fill={starred ? "#ffff00" : "none"}
                              className="inline w-6 h-6 align-top"
                            />
                          </a>
                        </div>
                        <p className="whitespace-nowrap font-bold overflow-hidden text-ellipsis md:self-center px-1 md:max-w-96">
                          {address}
                        </p>
                        <p
                          className={`whitespace-nowrap grow ${!seen ? "font-bold" : "opacity-70"} md:self-center px-1 overflow-hidden text-ellipsis`}
                        >
                          {answered ? (
                            <Reply
                              width={24}
                              height={24}
                              className="inline w-6 h-6 mr-2 rtl:mr-0 rtl:ml-2 align-top"
                            />
                          ) : (
                            ""
                          )}
                          {subject}
                        </p>
                        <p
                          className={`whitespace-nowrap px-1 ${!seen ? "font-bold" : ""} md:self-center`}
                        >
                          {t("datetime", {
                            val: date,
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
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : (
          <p className="text-center">
            {t(type == "spam" ? "nospam" : "nomessages")}
          </p>
        )}
      </>
    );
  }
}

export default EmailContent;
