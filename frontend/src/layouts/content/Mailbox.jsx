import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  RefreshCw,
  Reply,
  Search,
  Star,
  Trash,
  Ban,
  FolderInput,
  Mail,
  MailOpen,
  ThumbsUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { setMessages, resetLoading } from "@/slices/messagesSlice.js";
import { setMailboxes } from "@/slices/mailboxesSlice";

function EmailContent() {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedAny, setSelectedAny] = useState(false);
  const hasMoreThanOneMailbox = useSelector(
    (state) => state.mailboxes.mailboxes.length > 1
  );
  const hasSpamMailbox = useSelector((state) =>
    Boolean(
      state.mailboxes.mailboxes.find((mailbox) => {
        return mailbox.type == "spam";
      })
    )
  );
  const canMarkAsUnread = useSelector(
    (state) => state.capabilities.receiveCapabilities.markAsUnread
  );
  const canStar = useSelector(
    (state) => state.capabilities.receiveCapabilities.star
  );
  const mailboxId = useSelector((state) => state.mailboxes.currentMailbox);
  const mailboxType = useSelector(
    (state) => state.mailboxes.currentMailboxType
  );
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

  const getSelectedMessages = () => {
    const selectedMessagesArray = Object.keys(selectedMessages).filter((key) =>
      String(selectedMessages[key])
    );
    let additionalMessages = [];
    messages.forEach((message) => {
      if (selectedMessagesArray.indexOf(String(message.id)) != -1) {
        additionalMessages = [...additionalMessages, ...message.otherIds];
      }
    });
    return [...selectedMessagesArray, ...additionalMessages];
  };

  useEffect(() => {
    if (!mailboxesLoading) {
      const controller =
        typeof window.AbortController != "undefined"
          ? new AbortController()
          : undefined;
      const signal = controller ? controller.signal : undefined;

      dispatch(resetLoading());
      dispatch(setMailboxes);
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
        const controller =
          typeof window.AbortController != "undefined"
            ? new AbortController()
            : undefined;
        const signal = controller ? controller.signal : undefined;

        dispatch(setMailboxes);
        dispatch(setMessages(signal));

        return () => {
          if (controller) controller.abort();
        };
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

  useEffect(() => {
    if (!mailboxesLoading) document.title = title + " - MERNMail";
  }, [title, mailboxesLoading]);

  useEffect(() => {
    setSelectedAll(
      messages &&
        messages.length > 0 &&
        messages.every((message) => selectedMessages[message.id])
    );
    setSelectedAny(
      messages &&
        messages.length > 0 &&
        messages.find((message) => selectedMessages[message.id])
    );
  }, [selectedMessages, messages]);

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
          <h1 className="text-3xl md:text-4xl mb-0.5 pb-0.5 md:mb-0 md:pb-1 font-bold content-center whitespace-nowrap grow overflow-hidden text-ellipsis">
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
              onChange={() => {
                const currentSelectedAll = selectedAll;
                const newSelectedMessages = {};
                messages.forEach((message) => {
                  newSelectedMessages[message.id] = !currentSelectedAll;
                });
                setSelectedMessages(newSelectedMessages);
              }}
              className="w-6 h-6 inline-block m-1 align-middle"
              title={t("selectall")}
              readOnly={false}
              checked={selectedAll}
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
                document.location.hash = encodeURI("#search");
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
          {selectedAny ? (
            <>
              {hasSpamMailbox ? (
                mailboxType == "spam" ? (
                  <li className="inline-block mx-0.5">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        /*const messages = getSelectedMessages();
                      try {
                        const res = await fetch(
                          `/api/receive/spam/${mailboxId}`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                              messages: messages
                            }),
                            credentials: "include"
                          }
                        );
                        if (res.status == 200) {
                          const data = await res.json();
                          setSelectedMessages({});
                          document.location.hash = encodeURI(
                            `#mailbox/${data.spamMailbox}`
                          );
                        }
                        // eslint-disable-next-line no-unused-vars
                      } catch (err) {
                        // Can't set the message as spam
                      }*/
                      }}
                      title={t("notspam")}
                      className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <ThumbsUp
                        width={24}
                        height={24}
                        className="inline w-6 h-6 align-top"
                      />
                    </a>
                  </li>
                ) : (
                  <li className="inline-block mx-0.5">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/spam/${mailboxId}`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                messages: messages
                              }),
                              credentials: "include"
                            }
                          );
                          if (res.status == 200) {
                            const data = await res.json();
                            setSelectedMessages({});
                            document.location.hash = encodeURI(
                              `#mailbox/${data.spamMailbox}`
                            );
                          }
                          // eslint-disable-next-line no-unused-vars
                        } catch (err) {
                          // Can't set the message as spam
                        }
                      }}
                      title={t("markasspam")}
                      className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <Ban
                        width={24}
                        height={24}
                        className="inline w-6 h-6 align-top"
                      />
                    </a>
                  </li>
                )
              ) : (
                ""
              )}
              <li className="inline-block mx-0.5">
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    const messages = getSelectedMessages();
                    try {
                      const res = await fetch(
                        `/api/receive/delete/${mailboxId}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            messages: messages
                          }),
                          credentials: "include"
                        }
                      );
                      if (res.status == 200) {
                        const data = await res.json();
                        setSelectedMessages({});
                        if (data.trashMailbox) {
                          document.location.hash = encodeURI(
                            `#mailbox/${data.trashMailbox}`
                          );
                        } else {
                          dispatch(resetLoading());
                          setRefresh(true);
                        }
                      }
                      // eslint-disable-next-line no-unused-vars
                    } catch (err) {
                      // Can't delete the message
                    }
                  }}
                  title={t("delete")}
                  className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                >
                  <Trash
                    width={24}
                    height={24}
                    className="inline w-6 h-6 align-top"
                  />
                </a>
              </li>
              {canMarkAsUnread ? (
                <>
                  <li className="inline-block mx-0.5">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/unread/${mailboxId}`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                messages: messages
                              }),
                              credentials: "include"
                            }
                          );
                          if (res.status == 200) {
                            setSelectedMessages({});
                            dispatch(resetLoading());
                            setRefresh(true);
                          }
                        } catch (err) {
                          alert(err);
                          // Can't set messages as unread
                        }
                      }}
                      title={t("markasunread")}
                      className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <Mail
                        width={24}
                        height={24}
                        className="inline w-6 h-6 align-top"
                      />
                    </a>
                  </li>
                  <li className="inline-block mx-0.5">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/read/${mailboxId}`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({
                                messages: messages
                              }),
                              credentials: "include"
                            }
                          );
                          if (res.status == 200) {
                            setSelectedMessages({});
                            dispatch(resetLoading());
                            setRefresh(true);
                          }
                        } catch (err) {
                          alert(err);
                          // Can't set messages as read
                        }
                      }}
                      title={t("markasread")}
                      className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <MailOpen
                        width={24}
                        height={24}
                        className="inline w-6 h-6 align-top"
                      />
                    </a>
                  </li>
                </>
              ) : (
                ""
              )}
              {hasMoreThanOneMailbox ? (
                <li className="inline-block mx-0.5">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    title={t("move")}
                    className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                  >
                    <FolderInput
                      width={24}
                      height={24}
                      className="inline w-6 h-6 align-top"
                    />
                  </a>
                </li>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
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
                        document.location.hash = `#message/${mailboxId}/${id}`;
                      }}
                      className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            onChange={() => {
                              const newSelectedMessages = Object.assign(
                                {},
                                selectedMessages
                              );
                              newSelectedMessages[id] = !selectedMessages[id];
                              setSelectedMessages(newSelectedMessages);
                            }}
                            checked={selectedMessages[id] || false}
                            className="w-6 h-6 mx-1.5 my-1 inline-block align-middle"
                            title={t("select")}
                          />
                          {canStar ? (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
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
                          ) : (
                            ""
                          )}
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
                          {subject !== undefined && subject !== null
                            ? subject
                            : t("nosubject")}
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
