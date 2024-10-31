import { File, Paperclip, Send, X } from "lucide-react";
import { useState, lazy, Suspense, useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { filesize } from "filesize";
import isEmail from "validator/lib/isEmail";
import Loading from "@/components/Loading.jsx";
import { ToastContext } from "@/contexts/ToastContext.jsx";
import escapeHTML from "validator/lib/escape";
import DOMPurify from "dompurify";

// Lazy load Quill WYSIWYG editor due to its bundled script size
const ReactQuill = lazy(() => import("@/components/ReactQuill.jsx"));

function ComposeContent() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const [contents, setContents] = useState("");
  const [toField, setToField] = useState("");
  const [toValues, setToValues] = useState([]);
  const [ccShown, setCcShown] = useState(false);
  const [ccField, setCcField] = useState("");
  const [ccValues, setCcValues] = useState([]);
  const [bccShown, setBccShown] = useState(false);
  const [bccField, setBccField] = useState("");
  const [bccValues, setBccValues] = useState([]);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inReplyTo, setInReplyTo] = useState(null);
  const attachmentsRef = useRef();
  const email = useSelector((state) => state.auth.email);
  const maxAttachmentSize = 26214400;

  useEffect(() => {
    const controller =
      typeof window.AbortController != "undefined"
        ? new AbortController()
        : undefined;
    const signal = controller ? controller.signal : undefined;

    const blobToDataUrl = (blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
    };

    const loadComposer = async () => {
      // Reset all variables
      setContents("");
      setToField("");
      setToValues([]);
      setCcShown(false);
      setCcField("");
      setCcValues([]);
      setBccShown(false);
      setBccField("");
      setBccValues([]);
      setSubject("");
      setAttachments([]);
      setLoading(true);
      setInReplyTo(null);

      let messageData = null;
      let mailboxName = "";
      let messageId = "";
      let action = "default";
      try {
        const messageMatch = decodeURI(document.location.hash).match(
          /^#compose\/(reply|replyall|forward|draft)\/((?:(?!\/[^/]*$).)+)\/(.+)/
        );
        if (messageMatch) {
          action = messageMatch[1];
          mailboxName = messageMatch[2];
          messageId = messageMatch[3];
        }
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Hash URL parse error, invalid URL
      }

      mailboxName = mailboxName
        .replace(/(?:^|[/\\])\.\.(?=[/\\])/g, "")
        .replace(/^[/\\]+/g, "")
        .replace(/[/\\]+$/g, ""); // Sanitize the mailbox ID
      messageId = messageId.replace(/\.\./g, ""); // Sanitize the message ID

      if (action != "default") {
        if (mailboxName && messageId) {
          try {
            const res = await fetch(
              `/api/receive/message/${encodeURI(mailboxName)}/${encodeURI(messageId)}`,
              {
                method: "GET",
                credentials: "include",
                signal: signal
              }
            );
            const data = await res.json();
            if (res.status == 200) {
              messageData = data;
            }
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            // Error
          }
        }
        if (messageData) {
          const message = messageData.messages[messageData.messages.length - 1];
          const sanitizedBody = DOMPurify.sanitize(message.body, {
            WHOLE_DOCUMENT: true
          });
          const parsedBody = new DOMParser().parseFromString(
            sanitizedBody,
            "text/html"
          );
          const srcElements = parsedBody.querySelectorAll("[src]");
          for (let i = 0; i < srcElements.length; i++) {
            const srcElement = srcElements[i];
            if (srcElement.src) {
              const cidMatch = srcElement.src.match(/^cid:(.+)/);
              if (cidMatch) {
                const cid = cidMatch[1];
                const attachment = message.attachments.find((attachment) => {
                  return attachment.contentId == cid;
                });
                if (attachment) {
                  try {
                    const res = await fetch(
                      `/api/receive/attachment/${encodeURI(attachment.id)}`,
                      {
                        method: "GET",
                        credentials: "include",
                        signal: signal
                      }
                    );
                    const blob = await res.blob();
                    const preparedBlob = blob.slice(
                      0,
                      blob.size,
                      attachment.contentType || blob.type
                    );
                    const dataUrl = await blobToDataUrl(preparedBlob);
                    srcElement.src = dataUrl;
                    // eslint-disable-next-line no-unused-vars
                  } catch (err) {
                    // Can't download file
                  }
                }
              }
            }
          }
          const body = parsedBody.body.innerHTML;

          if (action == "draft") {
            setSubject(message.subject);
            setToValues(
              message.to.map((address) =>
                address.name
                  ? `${address.name} <${address.address}>`
                  : address.address
              )
            );
            setCcValues(
              message.cc.map((address) =>
                address.name
                  ? `${address.name} <${address.address}>`
                  : address.address
              )
            );
            if (message.cc.length > 0) setCcShown(true);
            setBccValues(
              message.bcc.map((address) =>
                address.name
                  ? `${address.name} <${address.address}>`
                  : address.address
              )
            );
            if (message.bcc.length > 0) setBccShown(true);
            setInReplyTo(message.inReplyTo);
            setContents(body);
            const filteredAttachments = message.attachments.filter(
              (attachment) =>
                !attachment.contentDisposition ||
                attachment.contentDisposition == "attachment"
            );
            const attachmentBlobs = [];
            for (let i = 0; i < filteredAttachments.length; i++) {
              const res = await fetch(
                `/api/receive/attachment/${encodeURI(filteredAttachments[i].id)}`,
                {
                  method: "GET",
                  credentials: "include",
                  signal: signal
                }
              );
              const blob = await res.blob();
              const preparedBlob = new window.File(
                [
                  blob.slice(
                    0,
                    blob.size,
                    filteredAttachments[i].contentType || blob.type
                  )
                ],
                filteredAttachments[i].filename || filteredAttachments[i].id
              );
              attachmentBlobs.push(preparedBlob);
            }
            setAttachments(attachmentBlobs);
          } else if (action == "forward") {
            setSubject(t("fwd", { subject: message.subject }));
            const info = `===== ${t("forwardedmessage")} =====\n${t("from", {
              from: message.from
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                )
                .join(", ")
            })}\n${t("to", {
              to: message.to
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                )
                .join(", ")
            })}\n${t("cc", {
              cc: message.cc
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                )
                .join(", ")
            })}\n${t("subject", { subject: message.subject })}\n===== ${t("forwardedmessage")} =====`;
            setContents(
              `<pre>${escapeHTML(info).replace(/\n/g, "<br>")}</pre>${body}`
            );
          } else if (action == "reply") {
            setSubject(t("re", { subject: message.subject }));
            setToValues(
              (message.replyTo && message.replyTo.length > 0
                ? message.replyTo
                : message.from
              ).map((address) =>
                address.name
                  ? `${address.name} <${address.address}>`
                  : address.address
              )
            );
            setInReplyTo(message.messageId);
            setContents(
              `<p>${escapeHTML(
                t("replymessage", {
                  date: new Date(message.date),
                  senders: message.from
                    .filter(
                      (address) => address.address && address.address != email
                    )
                    .map((address) =>
                      address.name
                        ? `${address.name} <${address.address}>`
                        : address.address
                    )
                    .join(", "),
                  formatParams: {
                    date: {
                      day: "numeric",
                      year: "numeric",
                      month: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    }
                  }
                })
              )}</p><blockquote>${body}</blockquote>`
            );
          } else if (action == "replyall") {
            setSubject(t("re", { subject: message.subject }));
            setToValues([
              ...(message.replyTo && message.replyTo.length > 0
                ? message.replyTo
                : message.from
              )
                .filter(
                  (address) => address.address && address.address != email
                )
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                ),
              ...message.to
                .filter(
                  (address) => address.address && address.address != email
                )
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                ),
              ...message.cc
                .filter(
                  (address) => address.address && address.address != email
                )
                .map((address) =>
                  address.name
                    ? `${address.name} <${address.address}>`
                    : address.address
                )
            ]);
            setInReplyTo(message.messageId);
            setContents(
              `<p>${escapeHTML(
                t("replymessage", {
                  date: new Date(message.date),
                  senders: message.from
                    .map((address) =>
                      address.name
                        ? `${address.name} <${address.address}>`
                        : address.address
                    )
                    .join(", "),
                  formatParams: {
                    date: {
                      day: "numeric",
                      year: "numeric",
                      month: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    }
                  }
                })
              )}</p><blockquote>${body}</blockquote>`
            );
          }
        }
      }
      setLoading(false);
    };

    loadComposer();

    window.addEventListener("popstate", loadComposer);

    return () => {
      window.removeEventListener("popstate", loadComposer);
    };
  }, [email, t]);

  useEffect(() => {
    document.title = `${t("compose")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <Suspense fallback={<Loading />}>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t("compose")}
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const blobToAttachmentEntry = (blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              return new Promise((resolve) => {
                reader.onloadend = () => {
                  resolve({
                    filename: blob.name,
                    content: reader.result.split(",")[1],
                    contentType: blob.type
                  });
                };
              });
            };

            setSending(true);

            try {
              const finalAttachments = [];
              for (let i = 0; i < attachments.length; i++) {
                const attachmentToPush = await blobToAttachmentEntry(
                  attachments[i]
                );
                finalAttachments.push(attachmentToPush);
              }

              const dataToSend = {
                from: email,
                to: toValues,
                cc: ccValues,
                bcc: bccValues,
                subject: subject,
                content: contents,
                inReplyTo: inReplyTo,
                attachments: finalAttachments
              };

              const res = await fetch("/api/send/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend),
                credentials: "include"
              });
              const data = await res.json();
              if (res.status == 200) {
                toast(t("sendsuccess"));
                document.location.hash = encodeURI("#mailbox");
              } else {
                setSending(false);
                toast(
                  t("sendfail", {
                    error: data.message
                  })
                );
              }
            } catch (err) {
              setSending(false);
              toast(
                t("sendfail", {
                  error: err.message
                })
              );
            }
          }}
        >
          <div className="flex flex-col md:flex-row mb-2">
            <span className="shrink-0  md:px-2 md:py-1">
              {t("from", { from: "" })}
            </span>
            <span className="grow md:px-2 md:py-1">{email}</span>
            <div className="shrink-0">
              {!ccShown ? (
                <button
                  className="bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 md:mt-0 md:mx-1 rounded-md hover:bg-primary/75 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setCcShown(true);
                  }}
                >
                  {t("cc", { cc: "" })}
                </button>
              ) : (
                ""
              )}
              {!bccShown ? (
                <button
                  className="bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 md:mt-0 md:mx-1 rounded-md hover:bg-primary/75 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setBccShown(true);
                  }}
                >
                  {t("bcc", { bcc: "" })}
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row mb-2">
            <label htmlFor="compose-to" className="shrink-0 md:px-2 md:py-1">
              {t("to", { to: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setToField(e.target.value)}
                value={toField}
                id="compose-to"
                placeholder="john.smith@example.com"
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                onKeyDown={(e) => {
                  if (e.key == "Enter" || e.key == "," || e.key == " ") {
                    e.preventDefault();
                    if (isEmail(toField)) {
                      setToValues([...toValues, toField]);
                      setToField("");
                    }
                  } else if (e.key == "Backspace" && toField == "") {
                    e.preventDefault();
                    const newToValues = [...toValues];
                    newToValues.pop();
                    setToValues(newToValues);
                  }
                }}
                onBlur={() => {
                  if (isEmail(toField)) {
                    setToValues([...toValues, toField]);
                    setToField("");
                  }
                }}
              />
              {toValues.length > 0 ? (
                <ul>
                  {toValues.map((toValue, index) => {
                    return (
                      <li
                        className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                        key={index}
                      >
                        <span className="align-middle">{toValue}</span>
                        <X
                          className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                          onClick={() => {
                            const newToValues = [...toValues];
                            newToValues.splice(index, 1);
                            setToValues(newToValues);
                          }}
                          size={24}
                        >
                          <title>{t("delete")}</title>
                        </X>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
              )}
            </div>
          </div>
          {ccShown ? (
            <div className="flex flex-col md:flex-row mb-2">
              <label htmlFor="compose-cc" className="shrink-0 md:px-2 md:py-1">
                {t("cc", { cc: "" })}
              </label>
              <div className="grow">
                <input
                  onChange={(e) => setCcField(e.target.value)}
                  value={ccField}
                  id="compose-cc"
                  placeholder="john.smith@example.com"
                  className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                  onKeyDown={(e) => {
                    if (e.key == "Enter" || e.key == "," || e.key == " ") {
                      e.preventDefault();
                      if (isEmail(ccField)) {
                        setCcValues([...ccValues, ccField]);
                        setCcField("");
                      }
                    } else if (e.key == "Backspace" && ccField == "") {
                      e.preventDefault();
                      const newCcValues = [...ccValues];
                      newCcValues.pop();
                      setCcValues(newCcValues);
                    }
                  }}
                  onBlur={() => {
                    if (isEmail(ccField)) {
                      setCcValues([...ccValues, ccField]);
                      setCcField("");
                    }
                  }}
                />
                {ccValues.length > 0 ? (
                  <ul>
                    {ccValues.map((ccValue, index) => {
                      return (
                        <li
                          className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                          key={index}
                        >
                          <span className="align-middle">{ccValue}</span>
                          <X
                            className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                            onClick={() => {
                              const newCcValues = [...ccValues];
                              newCcValues.splice(index, 1);
                              setCcValues(newCcValues);
                            }}
                            size={24}
                          >
                            <title>{t("delete")}</title>
                          </X>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            ""
          )}
          {bccShown ? (
            <div className="flex flex-col md:flex-row mb-2">
              <label htmlFor="compose-bcc" className="shrink-0 md:px-2 md:py-1">
                {t("bcc", { bcc: "" })}
              </label>
              <div className="grow">
                <input
                  onChange={(e) => setBccField(e.target.value)}
                  value={bccField}
                  id="compose-bcc"
                  placeholder="john.smith@example.com"
                  className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                  onKeyDown={(e) => {
                    if (e.key == "Enter" || e.key == "," || e.key == " ") {
                      e.preventDefault();
                      if (isEmail(bccField)) {
                        setBccValues([...bccValues, bccField]);
                        setBccField("");
                      }
                    } else if (e.key == "Backspace" && bccField == "") {
                      e.preventDefault();
                      const newBccValues = [...bccValues];
                      newBccValues.pop();
                      setBccValues(newBccValues);
                    }
                  }}
                  onBlur={() => {
                    if (isEmail(bccField)) {
                      setBccValues([...bccValues, bccField]);
                      setBccField("");
                    }
                  }}
                />
                {bccValues.length > 0 ? (
                  <ul>
                    {bccValues.map((bccValue, index) => {
                      return (
                        <li
                          className="inline-block bg-primary text-primary-foreground px-2 py-1 mt-2 mr-1 rtl:mr-0 rtl:ml-1 rounded-md hover:bg-primary/75 transition-colors"
                          key={index}
                        >
                          <span className="align-middle">{bccValue}</span>
                          <X
                            className="inline cursor-pointer ml-1 rtl:ml-0 rtl:mr-1 align-top"
                            onClick={() => {
                              const newBccValues = [...bccValues];
                              newBccValues.splice(index, 1);
                              setBccValues(newBccValues);
                            }}
                            size={24}
                          >
                            <title>{t("delete")}</title>
                          </X>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="flex flex-col md:flex-row mb-2">
            <label
              htmlFor="compose-subject"
              className="shrink-0 md:px-2 md:py-1"
            >
              {t("subject", { subject: "" })}
            </label>
            <div className="grow">
              <input
                onChange={(e) => setSubject(e.target.value)}
                value={subject}
                id="compose-subject"
                required
                className="w-full bg-accent text-accent-foreground px-2 py-1 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
          <ReactQuill
            theme="snow"
            value={contents}
            modules={{
              toolbar: {
                container: [
                  ["bold", "italic", "underline", "strike"],
                  ["blockquote", "code-block"],
                  ["link", "image"],

                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ script: "sub" }, { script: "super" }],
                  [{ direction: "rtl" }],

                  [{ size: ["10px", false, "18px", "32px"] }],
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],

                  [{ color: [] }, { background: [] }],
                  [{ font: [] }],
                  [{ align: [] }],

                  ["clean"]
                ]
              }
            }}
            onChange={(value) => {
              setContents(value);
            }}
          />
          <input
            type="file"
            className="hidden"
            ref={attachmentsRef}
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setAttachments([...attachments, e.target.files[0]]);
              }
            }}
          />
          <div className="flex flex-col md:flex-row mt-2">
            <div className="mr-2 rtl:mr-0 rtl:ml-2 md:self-center">
              <button
                className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/75 disabled:bg-primary/50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  attachmentsRef.current.click();
                }}
              >
                <Paperclip
                  className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                  size={24}
                />
                <span className="align-middle">{t("attach")}</span>
              </button>
            </div>
            <span className="mt-1 md:mt-0 md:self-center">
              {t("maxattachmentsize", {
                size: filesize(maxAttachmentSize, { standard: "jedec" })
              })}
            </span>
          </div>
          {attachments && attachments.length > 0 ? (
            <>
              <ul className="list-none border-border border-t-2 mx-2 mt-2">
                {attachments.map((attachment, index) => {
                  const id = URL.createObjectURL(attachment);
                  const size = attachment.size;
                  const filename = attachment.name;
                  return (
                    <li className="block border-border border-b-2" key={index}>
                      <div className="block bg-background px-1 md:pl-0.5 rtl:md:pl-1 rtl:md:pr-0.5 text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const newAttachments = [...attachments];
                            newAttachments.splice(index, 1);
                            setAttachments(newAttachments);
                          }}
                          title={t("delete")}
                          className="float-right inline-block align-middle w-6 h-6 my-1 ml-1 rtl:ml-0 rtl:mr-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors md:self-center shrink-0"
                        >
                          <X
                            width={16}
                            height={16}
                            className="inline w-6 h-6 align-top"
                          />
                        </button>
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
          <button
            type="submit"
            className="bg-primary text-primary-foreground p-2 mt-2 mr-2 rtl:mr-0 rtl:ml-2 rounded-md hover:bg-primary/75 disabled:bg-primary/50 transition-colors"
            disabled={
              (toValues.length == 0 &&
                ccValues.length == 0 &&
                bccValues.length == 0) ||
              attachments.reduce(
                (partialSum, attachment) => partialSum + (attachment.size || 0),
                0
              ) > maxAttachmentSize ||
              sending
            }
          >
            <Send
              className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
              size={24}
            />
            <span className="align-middle">{t("send")}</span>
          </button>
        </form>
      </Suspense>
    );
  }
}

export default ComposeContent;
