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
  ThumbsUp,
  File
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { setMessages, resetLoading } from "@/slices/messagesSlice.js";
import { setMailboxes } from "@/slices/mailboxesSlice";
import { ToastContext } from "@/contexts/ToastContext";
import Loading from "@/components/Loading.jsx";

function EmailContent() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const [refresh, setRefresh] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState({});
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedAny, setSelectedAny] = useState(false);
  const [moveShown, setMoveShown] = useState(false);
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
  const mailboxes = useSelector((state) => state.mailboxes.mailboxes);
  const mailboxId = useSelector((state) => state.mailboxes.currentMailbox);
  const mailboxType = useSelector(
    (state) => state.mailboxes.currentMailboxType
  );
  const newMessages = useSelector((state) => {
    const currentMailboxObject = state.mailboxes.mailboxes.find(
      (mailbox) => mailbox.id == state.mailboxes.currentMailbox
    );
    if (currentMailboxObject) {
      return currentMailboxObject.new || 0;
    } else {
      return 0;
    }
  });
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
  } else if (type == "archive") {
    title = t("archive");
  } else {
    title = titleSelected;
  }

  const getSelectedMessages = () => {
    const selectedMessagesArray = Object.keys(selectedMessages).filter(
      (key) => selectedMessages[key]
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

      setMoveShown(false);
      setSelectedMessages({});
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

        setMoveShown(false);
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
    if (!mailboxesLoading)
      document.title = `${newMessages > 0 ? "(" + newMessages + ") " : ""}${title} - MERNMail`;
    else document.title = "MERNMail";
  }, [title, mailboxesLoading, newMessages]);

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

  useEffect(() => {
    if (!selectedAny) setMoveShown(false);
  }, [selectedAny]);

  if (loading) {
    return <Loading />;
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
          <h1 className="text-3xl md:text-4xl mb-0.5 pb-0.5 md:mb-0 md:pb-1 font-bold content-center md:self-top grow overflow-hidden text-ellipsis">
            {title}
          </h1>
          <p className="md:text-xl text-muted-foreground content-center md:self-center whitespace-nowrap shrink-0">
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
            <button
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
            </button>
          </li>
          <li className="inline-block mx-0.5">
            <a
              href="#search"
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
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/toinbox/${encodeURI(mailboxId)}`,
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
                          const data = await res.json();
                          if (res.status == 200) {
                            toast(t("notspamsuccess"));
                            setSelectedMessages({});
                            document.location.hash = encodeURI(
                              `#mailbox/${data.inbox}`
                            );
                          } else {
                            toast(
                              t("notspamfail", {
                                error: data.message
                              })
                            );
                          }
                        } catch (err) {
                          toast(
                            t("notspamfail", {
                              error: err.message
                            })
                          );
                        }
                      }}
                      title={t("notspam")}
                      className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                    >
                      <ThumbsUp
                        width={24}
                        height={24}
                        className="inline w-6 h-6 align-top"
                      />
                    </button>
                  </li>
                ) : (
                  <li className="inline-block mx-0.5">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/spam/${encodeURI(mailboxId)}`,
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
                          const data = await res.json();
                          if (res.status == 200) {
                            toast(t("markasspamsuccess"));
                            setSelectedMessages({});
                            document.location.hash = encodeURI(
                              `#mailbox/${data.spamMailbox}`
                            );
                          } else {
                            toast(
                              t("markasspamfail", {
                                error: data.message
                              })
                            );
                          }
                        } catch (err) {
                          toast(
                            t("markasspamfail", {
                              error: err.message
                            })
                          );
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
                    </button>
                  </li>
                )
              ) : (
                ""
              )}
              <li className="inline-block mx-0.5">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    const messages = getSelectedMessages();
                    try {
                      const res = await fetch(
                        `/api/receive/delete/${encodeURI(mailboxId)}`,
                        {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            messages: messages
                          }),
                          credentials: "include"
                        }
                      );
                      const data = await res.json();
                      if (res.status == 200) {
                        toast(
                          t("deletesuccess", {
                            error: data.message
                          })
                        );
                        setSelectedMessages({});
                        if (data.trashMailbox) {
                          document.location.hash = encodeURI(
                            `#mailbox/${data.trashMailbox}`
                          );
                        } else {
                          dispatch(resetLoading());
                          setRefresh(true);
                        }
                      } else {
                        toast(
                          t("deletefail", {
                            error: data.message
                          })
                        );
                      }
                    } catch (err) {
                      toast(
                        t("deletefail", {
                          error: err.message
                        })
                      );
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
                </button>
              </li>
              {canMarkAsUnread ? (
                <>
                  <li className="inline-block mx-0.5">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/unread/${encodeURI(mailboxId)}`,
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
                          const data = await res.json();
                          if (res.status == 200) {
                            toast(t("markasunreadsuccess"));
                            setSelectedMessages({});
                            dispatch(resetLoading());
                            setRefresh(true);
                          } else {
                            toast(
                              t("markasunreadfail", {
                                error: data.message
                              })
                            );
                          }
                        } catch (err) {
                          toast(
                            t("markasunreadfail", {
                              error: err.message
                            })
                          );
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
                    </button>
                  </li>
                  <li className="inline-block mx-0.5">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const messages = getSelectedMessages();
                        try {
                          const res = await fetch(
                            `/api/receive/read/${encodeURI(mailboxId)}`,
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
                          const data = await res.json();
                          if (res.status == 200) {
                            toast(t("markasreadsuccess"));
                            setSelectedMessages({});
                            dispatch(resetLoading());
                            setRefresh(true);
                          } else {
                            toast(
                              t("markasreadfail", {
                                error: data.message
                              })
                            );
                          }
                        } catch (err) {
                          toast(
                            t("markasreadfail", {
                              error: err.message
                            })
                          );
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
                    </button>
                  </li>
                </>
              ) : (
                ""
              )}
              {hasMoreThanOneMailbox ? (
                <li className="relative inline-block mx-0.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMoveShown(!moveShown);
                    }}
                    title={t("move")}
                    className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                  >
                    <FolderInput
                      width={24}
                      height={24}
                      className="inline w-6 h-6 align-top"
                    />
                  </button>
                  {moveShown ? (
                    <ul className="block list-none absolute whitespace-nowrap top-full -right-16 rtl:right-auto rtl:-left-16 md:right-auto md:left-0 rtl:md:left-auto rtl:md:right-0 bg-background text-foreground border-border border rounded-md z-10">
                      {mailboxes
                        .filter((mailbox) => {
                          return mailbox.id != mailboxId;
                        })
                        .map((mailbox) => {
                          let title = mailbox.name;
                          let type = mailbox.type;
                          const id = mailbox.id;
                          const level = mailbox.level;
                          const openable = mailbox.openable;
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
                          }
                          return (
                            <li key={id}>
                              <a
                                href={encodeURI(`#mailbox/${id}`)}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (openable) {
                                    const messages = getSelectedMessages();
                                    try {
                                      const res = await fetch(
                                        `/api/receive/move/${encodeURI(mailboxId)}`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json"
                                          },
                                          body: JSON.stringify({
                                            messages: messages,
                                            destination: id
                                          }),
                                          credentials: "include"
                                        }
                                      );
                                      const data = await res.json();
                                      if (res.status == 200) {
                                        toast(t("movesuccess"));
                                        setSelectedMessages({});
                                        document.location.hash = encodeURI(
                                          `#mailbox/${id}`
                                        );
                                      } else {
                                        toast(
                                          t("movefail", {
                                            error: data.message
                                          })
                                        );
                                      }
                                    } catch (err) {
                                      toast(
                                        t("movefail", {
                                          error: err.message
                                        })
                                      );
                                    }
                                    setMoveShown(false);
                                  }
                                }}
                                title={title}
                                className={`bg-background text-foreground block overflow-hidden text-ellipsis whitespace-nowrap ${level == 0 ? "" : level == 1 ? "ml-4 rtl:ml-0 rtl:mr-4" : "ml-8 rtl:ml-0 rtl:mr-8"} px-2 py-0.5 hover:bg-accent/60 hover:text-accent-foreground transition-colors rounded-md`}
                              >
                                {title}
                              </a>
                            </li>
                          );
                        })}
                    </ul>
                  ) : (
                    ""
                  )}
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
                const draft = message.draft;
                const answered = message.answered;
                return (
                  <li className="block border-border border-b-2" key={id}>
                    <div
                      onClick={() => {
                        document.location.hash = encodeURI(
                          `#message/${mailboxId}/${id}`
                        );
                      }}
                      className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="shrink-0">
                          <span
                            className="inline-block shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <input
                              type="checkbox"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
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
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  try {
                                    const res = await fetch(
                                      `/api/receive/${starred ? "unstar" : "star"}/${encodeURI(mailboxId)}`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                          messages: [id]
                                        }),
                                        credentials: "include"
                                      }
                                    );
                                    const data = await res.json();
                                    if (res.status == 200) {
                                      toast(
                                        t(
                                          starred
                                            ? "unstarsuccess"
                                            : "starsuccess"
                                        )
                                      );
                                      dispatch(resetLoading());
                                      setRefresh(true);
                                    } else {
                                      toast(
                                        t(starred ? "unstarfail" : "starfail", {
                                          error: data.message
                                        })
                                      );
                                    }
                                  } catch (err) {
                                    toast(
                                      t(starred ? "unstarfail" : "starfail", {
                                        error: err.message
                                      })
                                    );
                                  }
                                }}
                                title={t(starred ? "unstar" : "star")}
                                className="inline-block align-middle shrink-0 w-8 h-8 p-1 mx-0.5 rounded-sm bg-inherit text-inherit hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                              >
                                <Star
                                  width={24}
                                  height={24}
                                  fill={starred ? "#ffff00" : "none"}
                                  className="inline w-6 h-6 align-top"
                                />
                              </button>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                        <p className="whitespace-nowrap font-bold overflow-hidden text-ellipsis md:self-center px-1 md:max-w-96">
                          {address}
                        </p>
                        <p
                          className={`whitespace-nowrap grow ${!seen ? "font-bold" : "text-muted-foreground"} md:self-center px-1 overflow-hidden text-ellipsis`}
                        >
                          <a
                            href={encodeURI(`#message/${mailboxId}/${id}`)}
                            className="block whitespace-nowrap text-ellipsis overflow-hidden"
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            {draft ? (
                              <File
                                width={24}
                                height={24}
                                className="inline w-6 h-6 mr-2 rtl:mr-0 rtl:ml-2 align-top"
                              />
                            ) : (
                              ""
                            )}
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
                          </a>
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
