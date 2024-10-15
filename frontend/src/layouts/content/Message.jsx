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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { filesize } from "filesize";

function MessageContent() {
  const iframeRef = useRef();
  const [iframeHeight, setIframeHeight] = useState("0px");
  const { t } = useTranslation();
  // Example message
  const messageData = {
    messages: [
      {
        seen: true,
        starred: false,
        answered: false,
        date: "2024-10-14T18:02:44.000Z",
        id: 1,
        subject: "Mail failure - no recipient addresses",
        from: [
          {
            name: "Mail Delivery System",
            address: "Mailer-Daemon@test-mail.home"
          }
        ],
        to: [
          {
            name: "",
            address: "sysadmin@test-mail.home"
          }
        ],
        body: "<!DOCTYPE html><html><head></head><body><pre>A message that you sent using the -t command line option contained no\naddresses that were not also on the command line, and were therefore\nsuppressed. This left no recipient addresses, and so no delivery could\nbe attempted.\n\n------ This is a copy of your message, including all the headers. ------\n\nFrom: sysadmin@localhost\nTo: sysadmin@localhost\nSubject: test\nMeMessage-Id: &lt;E1t0PP2-000000002G5-1Srj@test-mail.home&gt;\nDate: Mon, 14 Oct 2024 18:02:44 +0000\n\ntest\n</pre></body></html>",
        attachments: []
      }
    ]
  };
  const messagesToRender = [...messageData.messages];

  const onIframeLoad = () => {
    const body = iframeRef.current.contentWindow.document.body;
    const html = iframeRef.current.contentWindow.document.documentElement;
    setIframeHeight(Math.max(body.offsetHeight, html.offsetHeight) + "px");
  };

  useEffect(() => {
    window.addEventListener("resize", onIframeLoad);

    return () => {
      window.removeEventListener("resize", onIframeLoad);
    };
  }, []);

  if (messagesToRender.length == 0) {
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
                  ref={iframeRef}
                  onLoad={onIframeLoad}
                  className="bg-white w-full rounded-lg mb-2"
                  srcDoc={DOMPurify.sanitize(body)}
                  width="100%"
                  height={iframeHeight}
                />
                {attachments && attachments.length > 0 ? (
                  <>
                    <h1 className="text-xl md:text-2xl mx-2 mt-2 mb-1.5 pb-0.5 md:mb-1 md:pb-1 font-bold content-center whitespace-nowrap overflow-hidden text-ellipsis">
                      {t("attachments")}
                    </h1>
                    <ul className="list-none border-border border-t-2 mx-2">
                      {attachments.map((attachment) => {
                        const id = attachment.id;
                        const size = attachment.size;
                        const filename = attachment.filename;
                        return (
                          <li
                            className="block border-border border-b-2"
                            key={id}
                          >
                            <div
                              onClick={() => {
                                // TODO: open a message
                                alert(`Download attachment ${id}`);
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
