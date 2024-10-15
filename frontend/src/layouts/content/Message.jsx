import {
  ArrowLeft,
  Ban,
  File,
  FolderInput,
  Forward,
  Mail,
  Reply,
  ReplyAll,
  Trash
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { filesize } from "filesize";
import { useDispatch, useSelector } from "react-redux";
import { loadMessage, resetLoading } from "@/slices/messageSlice.js";
import { setMailboxes } from "@/slices/mailboxesSlice";
import download from "downloadjs";

function MessageContent() {
  const iframeRef = useRef({});

  const { t } = useTranslation();
  const view = useSelector((state) => state.view.view);
  const messageData = useSelector((state) => state.message.messageData);
  const loading = useSelector((state) => state.message.loading);
  const error = useSelector((state) => state.message.error);
  const dispatch = useDispatch();
  const messagesToRender = [...messageData.messages];

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    dispatch(resetLoading());
    dispatch(setMailboxes);
    dispatch(loadMessage(signal));

    return () => {
      if (controller) controller.abort();
    };
  }, [dispatch]);

  const replaceCIDsOnIframeLoad = (iframeRefContents, attachments) => {
    return () => {
      const srcElements =
        iframeRefContents.contentWindow.document.querySelectorAll("[src]");
      srcElements.forEach((srcElement) => {
        if (srcElement.src) {
          const cidMatch = srcElement.src.match(/^cid:(.+)/);
          if (cidMatch) {
            const cid = cidMatch[1];
            const attachment = attachments.find((attachment) => {
              return attachment.contentId == cid;
            });
            if (attachment)
              srcElement.src = `/api/receive/attachment/${attachment.id}`;
          }
        }
      });
    };
  };

  const processLinksOnIframeLoad = (iframeRefContents) => {
    return () => {
      const aElements =
        iframeRefContents.contentWindow.document.querySelectorAll("a");
      aElements.forEach((aElement) => {
        aElement.target = "_parent";
      });
    };
  };

  const resizeOnIframeLoad = (iframeRefContents) => {
    return () => {
      const body = iframeRefContents.contentWindow.document.body;
      const html = iframeRefContents.contentWindow.document.documentElement;
      iframeRefContents.height =
        Math.max(body.offsetHeight, html.offsetHeight) + "px";
    };
  };

  useEffect(() => {
    const resizeOnIframeLoadAllRefs = () => {
      Object.keys(iframeRef.current).forEach((refKey) => {
        resizeOnIframeLoad(iframeRef.current[refKey])();
      });
    };

    window.addEventListener("resize", resizeOnIframeLoadAllRefs);

    return () => {
      window.removeEventListener("resize", resizeOnIframeLoadAllRefs);
    };
  }, []);

  useEffect(() => {
    if (messageData.length > 0)
      document.title =
        messageData[messageData.length - 1].subject + " - MERNMail";
  }, [messageData]);

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
          dispatch(setMailboxes);
          dispatch(loadMessage(signal));
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        if (controller) controller.abort();
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  if (loading) {
    return <p className="text-center">{t("loading")}</p>;
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
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center whitespace-nowrap overflow-hidden text-ellipsis">
          {messagesToRender[messagesToRender.length - 1].answered ? (
            <Reply
              width={32}
              height={32}
              className="inline w-9 h-9 md:w-10 md:h-10 mr-2 rtl:mr-0 rtl:ml-2 align-top"
            />
          ) : (
            ""
          )}
          {messagesToRender[messagesToRender.length - 1].subject}
        </h1>
        <ul className="mx-0.5 list-none">
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
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
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
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
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
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
          <li className="inline-block mx-0.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
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
        </ul>
        {messagesToRender
          .slice()
          .reverse()
          .map((message) => {
            const from = message.from;
            const to = message.to;
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
            const fromInitials = firstFrom.name
              ? firstFrom.name
                  .split(" ")
                  .map((str) => {
                    return str[0];
                  })
                  .join("")
                  .toUpperCase()
              : firstFrom.address[0].toUpperCase();

            return (
              <div className="border-b-2 border-border" key={id}>
                <div className="flex flex-col lg:flex-row mb-2">
                  <div className="shrink-0 w-16 h-16 py-3 m-1 leading-10 text-2xl overflow-hidden text-ellipsis rounded-full bg-accent text-accent-foreground font-bold text-center items-center select-none">
                    {fromInitials}
                  </div>
                  <div className="grow whitespace-nowrap overflow-hidden text-ellipsis ml-1 rtl:ml-0 rtl:mr-1 lg:mx-0 lg:self-center">
                    <p className="block overflow-hidden text-ellipsis">
                      {firstFrom.name ? (
                        <>
                          <span className="font-bold text-lg align-middle">
                            {firstFrom.name}{" "}
                          </span>
                          <span className="text-foreground/50 align-middle">{`<${firstFrom.address}>`}</span>
                        </>
                      ) : (
                        <span className="font-bold text-lg align-middle">
                          {firstFrom.address}
                        </span>
                      )}
                      {from.slice(1, from.length).map((fromObject) => {
                        return (
                          <span
                            className="text-foreground/50 align-middle"
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
                    <p className="block text-foreground/50 overflow-hidden text-ellipsis">
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
                  </div>
                  <p className="whitespace-nowrap px-1 lg:self-center">
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
                  <ul className="mx-0.5 list-none whitespace-nowrap lg:self-center">
                    <li className="inline-block mx-0.5">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
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
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
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
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
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
                <iframe
                  ref={(el) => (iframeRef.current[id] = el)}
                  onLoad={() => {
                    setTimeout(() => {
                      replaceCIDsOnIframeLoad(
                        iframeRef.current[id],
                        attachments
                      )();
                      processLinksOnIframeLoad(iframeRef.current[id])();
                      resizeOnIframeLoad(iframeRef.current[id])();
                      setTimeout(() => {
                        try {
                          resizeOnIframeLoad(iframeRef.current[id])();
                          // eslint-disable-next-line no-unused-vars
                        } catch (err) {
                          // Don't reload when it failed
                        }
                      }, 100);
                    }, 0);
                  }}
                  className="bg-white w-full rounded-lg mb-2"
                  srcDoc={DOMPurify.sanitize(body, {
                    WHOLE_DOCUMENT: true
                  })}
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
                                    `/api/receive/attachment/${id}`,
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <Reply
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      {t("reply")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <ReplyAll
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      {t("replyall")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 transition-colors"
                    >
                      <Forward
                        className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                        size={24}
                      />
                      {t("forward")}
                    </button>
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
