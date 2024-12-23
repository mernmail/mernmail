import {
  ArrowLeft,
  Ban,
  File,
  FolderInput,
  Forward,
  Mail,
  MailPlus,
  Reply,
  ReplyAll,
  Star,
  ThumbsUp,
  Trash,
  TriangleAlert
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "@/contexts/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { filesize } from "filesize";
import { useDispatch, useSelector } from "react-redux";
import { loadMessage, resetLoading } from "@/slices/messageSlice.js";
import { setMailboxes } from "@/slices/mailboxesSlice.js";
import { ToastContext } from "@/contexts/ToastContext.jsx";
import Loading from "@/components/Loading.jsx";
import download from "downloadjs";

function MessageContent() {
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);
  const { toast } = useContext(ToastContext);
  const [juice, setJuice] = useState(null);
  const [moveShown, setMoveShown] = useState(false);
  const view = useSelector((state) => state.view.view);
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
  const mailboxes = useSelector((state) => state.mailboxes.mailboxes);
  const mailboxId = useSelector((state) => state.mailboxes.currentMailbox);
  const mailboxType = useSelector(
    (state) => state.mailboxes.currentMailboxType
  );
  const canMarkAsUnread = useSelector(
    (state) => state.capabilities.receiveCapabilities.markAsUnread
  );
  const canStar = useSelector(
    (state) => state.capabilities.receiveCapabilities.star
  );
  const messageData = useSelector((state) => state.message.messageData);
  const loading = useSelector((state) => state.message.loading);
  const error = useSelector((state) => state.message.error);
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();
  const messagesToRender = [...messageData.messages];

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    setMoveShown(false);
    dispatch(resetLoading());
    dispatch(loadMessage(signal));
    dispatch(setMailboxes);

    return () => {
      if (controller) controller.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    if (refresh) {
      if (loading) {
        const controller =
          typeof window.AbortController != "undefined"
            ? new AbortController()
            : undefined;
        const signal = controller ? controller.signal : undefined;

        setMoveShown(false);
        dispatch(loadMessage(signal));
        dispatch(setMailboxes);

        return () => {
          if (controller) controller.abort();
        };
      } else {
        setRefresh(false);
      }
    }
  }, [refresh, loading, dispatch]);

  const isLightOrDark = (rgbColor) => {
    let [r, g, b] = rgbColor;
    let hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5 ? "light" : "dark";
  };

  const flipLightness = (rgb) => {
    // Convert RGB to HSL
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    // Flip lightness
    l = 1 - l;

    // Convert HSL back to RGB
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    // Return RGB
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const getMessageIds = () => {
    return messagesToRender
      .slice()
      .reverse()
      .map((message) => message.id);
  };

  useEffect(() => {
    if (!loading && messageData && messageData.messages.length > 0)
      document.title = `${
        messageData.messages[messageData.messages.length - 1].subject !==
          undefined &&
        messageData.messages[messageData.messages.length - 1].subject !== null
          ? messageData.messages[messageData.messages.length - 1].subject
          : t("nosubject")
      } - MERNMail`;
    else document.title = "MERNMail";
  }, [messageData, loading, t]);

  useEffect(() => {
    if (view == "message") {
      const controller =
        typeof window.AbortController != "undefined"
          ? new AbortController()
          : undefined;
      const signal = controller ? controller.signal : undefined;

      const onBackButtonEvent = () => {
        setTimeout(() => {
          dispatch(resetLoading());
          dispatch(loadMessage(signal));
          dispatch(setMailboxes);
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        if (controller) controller.abort();
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  useEffect(() => {
    const loadJuice = async () => {
      const newJuice = (await import("juice/client")).default;
      // Set juice to be a function. The function which returns the function is passed into setJuice
      setJuice(() => newJuice);
    };

    loadJuice();
  }, []);

  if (loading || !juice) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">
        {t("cantloadmessage", { error: error })}
      </p>
    );
  } else if (messagesToRender.length == 0) {
    return <p className="text-center">{t("messagenotfound")}</p>;
  } else {
    messagesToRender[messagesToRender.length - 1] = {
      ...messagesToRender[messagesToRender.length - 1],
      firstMessage: true
    };
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {messagesToRender[messagesToRender.length - 1].answered ? (
            <Reply
              width={32}
              height={32}
              className="inline w-9 h-9 md:w-10 md:h-10 mr-2 rtl:mr-0 rtl:ml-2 align-top"
            />
          ) : (
            ""
          )}
          {messagesToRender[messagesToRender.length - 1].draft ? (
            <File
              width={32}
              height={32}
              className="inline w-9 h-9 md:w-10 md:h-10 mr-2 rtl:mr-0 rtl:ml-2 align-top"
            />
          ) : (
            ""
          )}
          {messagesToRender[messagesToRender.length - 1].subject !==
            undefined &&
          messagesToRender[messagesToRender.length - 1].subject !== null
            ? messagesToRender[messagesToRender.length - 1].subject
            : t("nosubject")}
        </h1>
        <ul className="mx-0.5 list-none">
          <li className="inline-block mx-0.5">
            <a
              href={encodeURI(`#mailbox/${mailboxId}`)}
              onClick={(e) => {
                e.preventDefault();
                document.location.hash = encodeURI(`#mailbox/${mailboxId}`);
              }}
              title={t("back")}
              className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft
                width={24}
                height={24}
                className="inline w-6 h-6 align-top"
              />
            </a>
          </li>
          {messagesToRender[messagesToRender.length - 1].draft ? (
            <li className="inline-block mx-0.5">
              <a
                href={`#compose/draft/${encodeURI(mailboxId)}/${encodeURI(messagesToRender[messagesToRender.length - 1].id)}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.location.hash = encodeURI(
                    `#compose/draft/${mailboxId}/${messagesToRender[messagesToRender.length - 1].id}`
                  );
                }}
                title={t("compose")}
                className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
              >
                <MailPlus className="inline w-6 h-6 align-top" />
              </a>
            </li>
          ) : (
            ""
          )}
          {canStar ? (
            <li className="inline-block mx-0.5">
              <button
                onClick={async (e) => {
                  e.preventDefault();

                  try {
                    const res = await fetch(
                      `/api/receive/${messagesToRender[messagesToRender.length - 1].starred ? "unstar" : "star"}/${encodeURI(mailboxId)}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          messages: [
                            messagesToRender[messagesToRender.length - 1].id
                          ]
                        }),
                        credentials: "include"
                      }
                    );
                    const data = await res.json();
                    if (res.status == 200) {
                      toast(
                        t(
                          messagesToRender[messagesToRender.length - 1].starred
                            ? "unstarsuccess"
                            : "starsuccess"
                        )
                      );
                      dispatch(resetLoading());
                      setRefresh(true);
                    } else {
                      toast(
                        t(
                          messagesToRender[messagesToRender.length - 1].starred
                            ? "unstarfail"
                            : "starfail",
                          {
                            error: data.message
                          }
                        )
                      );
                    }
                  } catch (err) {
                    toast(
                      t(
                        messagesToRender[messagesToRender.length - 1].starred
                          ? "unstarfail"
                          : "starfail",
                        {
                          error: err.message
                        }
                      )
                    );
                  }
                }}
                title={t(
                  messagesToRender[messagesToRender.length - 1].starred
                    ? "unstar"
                    : "star"
                )}
                className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
              >
                <Star
                  width={24}
                  height={24}
                  fill={
                    messagesToRender[messagesToRender.length - 1].starred
                      ? "#ffff00"
                      : "none"
                  }
                  className="inline w-6 h-6 align-top"
                />
              </button>
            </li>
          ) : (
            ""
          )}
          {hasSpamMailbox ? (
            mailboxType == "spam" ? (
              <li className="inline-block mx-0.5">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch(
                        `/api/receive/toinbox/${encodeURI(mailboxId)}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            messages: getMessageIds()
                          }),
                          credentials: "include"
                        }
                      );
                      const data = await res.json();
                      if (res.status == 200) {
                        toast(t("notspamsuccess"));
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

                    try {
                      const res = await fetch(
                        `/api/receive/spam/${encodeURI(mailboxId)}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            messages: getMessageIds()
                          }),
                          credentials: "include"
                        }
                      );
                      const data = await res.json();
                      if (res.status == 200) {
                        toast(t("markasspamsuccess"));
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
                try {
                  const res = await fetch(
                    `/api/receive/delete/${encodeURI(mailboxId)}`,
                    {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        messages: getMessageIds()
                      }),
                      credentials: "include"
                    }
                  );
                  const data = await res.json();
                  if (res.status == 200) {
                    toast(t("deletesuccess"));
                    if (data.trashMailbox) {
                      document.location.hash = encodeURI(
                        `#mailbox/${data.trashMailbox}`
                      );
                    } else {
                      document.location.hash = encodeURI(
                        `#mailbox/${mailboxId}`
                      );
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
            <li className="inline-block mx-0.5">
              <button
                onClick={async (e) => {
                  e.preventDefault();

                  try {
                    const res = await fetch(
                      `/api/receive/unread/${encodeURI(mailboxId)}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          messages: getMessageIds()
                        }),
                        credentials: "include"
                      }
                    );
                    const data = await res.json();
                    if (res.status == 200) {
                      toast(t("markasunreadsuccess"));
                      document.location.hash = encodeURI(
                        `#mailbox/${mailboxId}`
                      );
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
                      } else if (type == "archive") {
                        title = t("archive");
                      }
                      return (
                        <li key={id}>
                          <a
                            href={encodeURI(`#mailbox/${id}`)}
                            onClick={async (e) => {
                              e.preventDefault();
                              if (openable) {
                                try {
                                  const res = await fetch(
                                    `/api/receive/move/${encodeURI(mailboxId)}`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json"
                                      },
                                      body: JSON.stringify({
                                        messages: getMessageIds(),
                                        destination: id
                                      }),
                                      credentials: "include"
                                    }
                                  );
                                  const data = await res.json();
                                  if (res.status == 200) {
                                    toast(t("movesuccess"));
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
        </ul>
        {mailboxType == "spam" ? (
          <div className="flex flex-column md:flex-row my-2">
            <TriangleAlert
              width={24}
              height={24}
              className="inline-block w-8 h-8 p-1 align-top shrink-0"
            />
            <p className="mx-1 self-center">{t("spamwarning")}</p>
          </div>
        ) : (
          ""
        )}
        {messagesToRender
          .slice()
          .reverse()
          .map((message) => {
            const from = message.from;
            const to = message.to;
            const cc = message.cc;
            const bcc = message.bcc;
            const date = new Date(message.date);
            const id = message.id;
            const body = message.body;
            const attachments = message.attachments;
            const realAttachments = (attachments || []).filter((attachment) => {
              return (
                !attachment.contentDisposition ||
                attachment.contentDisposition == "attachment"
              );
            });
            const firstMessage = message.firstMessage;
            const firstFrom = message.from[0] || {
              address: "unknown@example.com"
            };
            const firstFromAddress = firstFrom.address || "unknown@example.com";
            const inlinedBody = juice(body);
            const sanitizedBody = DOMPurify.sanitize(inlinedBody, {
              WHOLE_DOCUMENT: true,
              FORBID_TAGS: ["style"],
              FORBID_ATTR: ["class"]
            });
            const parsedDocument = new DOMParser().parseFromString(
              sanitizedBody,
              "text/html"
            );
            const aElements = parsedDocument.querySelectorAll("a");
            aElements.forEach((aElement) => {
              const currentHashURL =
                document.location.origin + document.location.pathname + "#";
              if (
                !aElement.href ||
                aElement.href.slice(0, 1) == "#" ||
                aElement.href.slice(0, currentHashURL.length) == currentHashURL
              ) {
                // Prevent changing the URL when clicking the link
                aElement.removeAttribute("href");
                aElement.removeAttribute("target");
                if (!aElement.style.cursor) aElement.style.cursor = "pointer";
              }
            });

            const formElements = parsedDocument.querySelectorAll("form");
            formElements.forEach((formElement) => {
              const currentHashURL =
                document.location.origin + document.location.pathname + "#";
              if (
                !formElement.action ||
                formElement.action.slice(0, 1) == "#" ||
                formElement.action.slice(0, currentHashURL.length) ==
                  currentHashURL
              ) {
                // Replace the <form> element with a <div> element
                const newElement = document.createElement("div");
                const formStyle = formElement.getAttribute("style");
                if (formStyle !== null)
                  newElement.setAttribute("style", formStyle);
                const formId = formElement.getAttribute("id");
                if (formId !== null) newElement.setAttribute("id", formId);
                newElement.innerHTML = formElement.innerHTML;
                if (formElement.parentNode)
                  formElement.parentNode.replaceChild(newElement, formElement);
                else
                  throw new Error(
                    "Can't render the email message: form's parent node is null!"
                  );
              }
            });

            const srcElements = parsedDocument.querySelectorAll("[src]");
            srcElements.forEach((srcElement) => {
              if (srcElement.src) {
                const cidMatch = srcElement.src.match(/^cid:(.+)/);
                if (cidMatch) {
                  const cid = cidMatch[1];
                  const attachment = attachments.find((attachment) => {
                    return attachment.contentId == cid;
                  });
                  if (attachment) {
                    srcElement.src = `/api/receive/attachment/${attachment.id}`;
                  }
                }
              }
            });

            const allBodyElements = parsedDocument.querySelectorAll("body *");
            allBodyElements.forEach((element) => {
              if (element.getAttribute("color") && !element.style.color) {
                element.style.color = element.getAttribute("color");
                element.removeAttribute("color");
              }

              if (
                element.getAttribute("bgcolor") &&
                !element.style.backgroundColor
              ) {
                element.style.backgroundColor = element.getAttribute("bgcolor");
                element.removeAttribute("bgcolor");
              }

              if (
                (element.tagName == "TABLE" ||
                  element.tagName == "TBODY" ||
                  element.tagName == "TR" ||
                  element.tagName == "TH" ||
                  element.tagName == "TD") &&
                element.getAttribute("width") &&
                !element.style.width
              ) {
                element.style.width = element.getAttribute("width");
                element.removeAttribute("width");
              }

              if (
                (element.tagName == "TABLE" ||
                  element.tagName == "TBODY" ||
                  element.tagName == "TR" ||
                  element.tagName == "TH" ||
                  element.tagName == "TD") &&
                element.getAttribute("height") &&
                !element.style.height
              ) {
                element.style.height = element.getAttribute("height");
                element.removeAttribute("height");
              }

              if (
                element.style.position == "fixed" ||
                element.style.position == "sticky"
              )
                element.style.position = "absolute";

              const computedStyle = window.getComputedStyle(element);
              if (
                element.style.font ||
                element.style.color ||
                element.getAttribute("color")
              ) {
                const parsedColorMatch = computedStyle.color.match(
                  /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})(?:, (\d{1,3}))?\)/
                );
                if (parsedColorMatch) {
                  const r = parseInt(parsedColorMatch[1]);
                  const g = parseInt(parsedColorMatch[2]);
                  const b = parseInt(parsedColorMatch[3]);
                  if (
                    isLightOrDark([r, g, b]) == (isDarkMode ? "dark" : "light")
                  ) {
                    const newColors = flipLightness([r, g, b]);
                    element.style.color = `rgba(${newColors[0]}, ${newColors[1]}, ${newColors[2]}, ${parsedColorMatch[4] ? parsedColorMatch[4] : 255})`;
                  }
                }
              }
              if (
                element.style.background ||
                element.style.backgroundColor ||
                element.getAttribute("bgcolor")
              ) {
                const parsedColorMatch = computedStyle.backgroundColor.match(
                  /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})(?:, (\d{1,3}))?\)/
                );
                if (parsedColorMatch) {
                  const r = parseInt(parsedColorMatch[1]);
                  const g = parseInt(parsedColorMatch[2]);
                  const b = parseInt(parsedColorMatch[3]);
                  if (
                    isLightOrDark([r, g, b]) == (isDarkMode ? "light" : "dark")
                  ) {
                    const newColors = flipLightness([r, g, b]);
                    element.style.backgroundColor = `rgba(${newColors[0]}, ${newColors[1]}, ${newColors[2]}, ${parsedColorMatch[4] ? parsedColorMatch[4] : 255})`;
                  }
                }
              }
            });

            const emailBody = parsedDocument.body.innerHTML;

            return (
              <div className="border-b-2 border-border" key={id}>
                <div className="flex flex-col lg:flex-row mb-2">
                  <img
                    src={`/api/receive/avatar/${firstFromAddress
                      .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
                      .replace(/^[/\\]+/g, "")
                      .replace(/[/\\]+$/g, "")}/avatar.svg`}
                    alt={firstFrom.name || "Avatar"}
                    className="shrink-0 w-16 h-16 m-1 mr-2 rtl:mr-1 rtl:ml-2 bg-accent text-accent-foreground rounded-full font-bold"
                  ></img>
                  <div className="grow overflow-hidden text-ellipsis ml-1 rtl:ml-0 rtl:mr-1 lg:mx-0 lg:self-center">
                    <p className="block overflow-hidden text-ellipsis">
                      {firstFrom.name ? (
                        <>
                          <span className="font-bold text-lg align-middle">
                            {firstFrom.name}{" "}
                          </span>
                          <span className="text-muted-foreground align-middle">{`<${firstFrom.address}>`}</span>
                        </>
                      ) : (
                        <span className="font-bold text-lg align-middle">
                          {firstFrom.address}
                        </span>
                      )}
                      {from.slice(1, from.length).map((fromObject) => {
                        return (
                          <span
                            className="text-muted-foreground align-middle"
                            key={fromObject.address}
                          >
                            {", " +
                              (fromObject.name
                                ? `${fromObject.name} <${fromObject.address}>`
                                : fromObject.address)}
                          </span>
                        );
                      })}
                    </p>
                    <p className="block text-muted-foreground overflow-hidden text-ellipsis">
                      {t("to", {
                        to: to
                          .map((toObject) => {
                            return toObject.name
                              ? `${toObject.name} <${toObject.address}>`
                              : toObject.address;
                          })
                          .join(", ")
                      })}
                    </p>
                    {cc && cc.length > 0 ? (
                      <p className="block text-muted-foreground overflow-hidden text-ellipsis">
                        {t("cc", {
                          cc: cc
                            .map((ccObject) => {
                              return ccObject.name
                                ? `${ccObject.name} <${ccObject.address}>`
                                : ccObject.address;
                            })
                            .join(", ")
                        })}
                      </p>
                    ) : (
                      ""
                    )}
                    {bcc && bcc.length > 0 ? (
                      <p className="block text-muted-foreground overflow-hidden text-ellipsis">
                        {t("bcc", {
                          bcc: bcc
                            .map((bccObject) => {
                              return bccObject.name
                                ? `${bccObject.name} <${bccObject.address}>`
                                : bccObject.address;
                            })
                            .join(", ")
                        })}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <p className="px-1 shrink-0 lg:self-center">
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
                  <ul className="mx-0.5 list-none shrink-0 lg:self-center">
                    <li className="inline-block mx-0.5">
                      <a
                        href={`#compose/reply/${encodeURI(mailboxId)}/${encodeURI(message.id)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.location.href = encodeURI(
                            `#compose/reply/${mailboxId}/${message.id}`
                          );
                        }}
                        title={t("reply")}
                        className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                      >
                        <Reply
                          width={24}
                          height={24}
                          className="inline w-6 h-6 align-top"
                        />
                      </a>
                    </li>
                    <li className="inline-block mx-0.5">
                      <a
                        href={`#compose/replyall/${encodeURI(mailboxId)}/${encodeURI(message.id)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.location.href = encodeURI(
                            `#compose/replyall/${mailboxId}/${message.id}`
                          );
                        }}
                        title={t("replyall")}
                        className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                      >
                        <ReplyAll
                          width={24}
                          height={24}
                          className="inline w-6 h-6 align-top"
                        />
                      </a>
                    </li>
                    <li className="inline-block mx-0.5">
                      <a
                        href={`#compose/forward/${encodeURI(mailboxId)}/${encodeURI(message.id)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.location.href = encodeURI(
                            `#compose/forward/${mailboxId}/${message.id}`
                          );
                        }}
                        title={t("forward")}
                        className="inline-block align-middle w-8 h-8 p-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                      >
                        <Forward
                          width={24}
                          height={24}
                          className="inline w-6 h-6 align-top"
                        />
                      </a>
                    </li>
                  </ul>
                </div>
                <div
                  className="prose prose-email w-full max-w-full overflow-x-auto rounded-lg relative mb-2"
                  dangerouslySetInnerHTML={{ __html: emailBody }}
                />
                {realAttachments && realAttachments.length > 0 ? (
                  <>
                    <h1 className="text-xl md:text-2xl mx-2 mt-2 mb-1.5 pb-0.5 md:mb-1 md:pb-1 font-bold content-center whitespace-nowrap overflow-hidden text-ellipsis">
                      {t("attachments")}
                    </h1>
                    <ul className="list-none border-border border-t-2 mx-2">
                      {realAttachments.map((attachment) => {
                        const id = attachment.id;
                        const size = attachment.size;
                        const filename = attachment.filename;
                        return (
                          <li
                            className="block border-border border-b-2"
                            key={id}
                          >
                            <div
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `/api/receive/attachment/${encodeURI(id)}`,
                                    {
                                      method: "GET",
                                      credentials: "include"
                                    }
                                  );
                                  const blob = await res.blob();
                                  download(
                                    blob,
                                    attachment.filename,
                                    attachment.contentType
                                  );
                                  // eslint-disable-next-line no-unused-vars
                                } catch (err) {
                                  // Can't download file
                                }
                              }}
                              className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors cursor-pointer"
                            >
                              <div className="flex flex-col md:flex-row">
                                <File
                                  width={24}
                                  height={24}
                                  className="inline-block w-6 h-6 my-1 align-top"
                                />
                                <p className="whitespace-nowrap font-bold overflow-hidden text-ellipsis md:self-center px-1 grow">
                                  {filename ? filename : id}
                                </p>
                                {size ? (
                                  <p className="whitespace-nowrap overflow-hidden text-ellipsis md:self-center px-1 shrink-0">
                                    {filesize(size, { standard: "jedec" })}
                                  </p>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  ""
                )}
                {firstMessage ? (
                  <div className="border-t-2 border-border my-2">
                    <a
                      href={`#compose/reply/${encodeURI(mailboxId)}/${encodeURI(messagesToRender[messagesToRender.length - 1].id)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.location.href = encodeURI(
                          `#compose/reply/${mailboxId}/${messagesToRender[messagesToRender.length - 1].id}`
                        );
                      }}
                      className="inline-block text-center bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <Reply
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      <span className="align-middle">{t("reply")}</span>
                    </a>
                    <a
                      href={`#compose/replyall/${encodeURI(mailboxId)}/${encodeURI(messagesToRender[messagesToRender.length - 1].id)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.location.href = encodeURI(
                          `#compose/replyall/${mailboxId}/${messagesToRender[messagesToRender.length - 1].id}`
                        );
                      }}
                      className="inline-block text-center bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <ReplyAll
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      <span className="align-middle">{t("replyall")}</span>
                    </a>
                    <a
                      href={`#compose/forward/${encodeURI(mailboxId)}/${encodeURI(messagesToRender[messagesToRender.length - 1].id)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.location.href = encodeURI(
                          `#compose/forward/${mailboxId}/${messagesToRender[messagesToRender.length - 1].id}`
                        );
                      }}
                      className="inline-block text-center bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <Forward
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      <span className="align-middle">{t("forward")}</span>
                    </a>
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })}
      </>
    );
  }
}

export default MessageContent;
