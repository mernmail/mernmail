import {
  Folder,
  Inbox,
  Star,
  SendHorizontal,
  File,
  Ban,
  Trash,
  CircleAlert,
  Mail,
  X,
  Pencil,
  Plus,
  Check,
  Archive
} from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setMailboxes } from "@/slices/mailboxesSlice.js";
import { ToastContext } from "@/contexts/ToastContext.jsx";

function MailboxesSettings() {
  const { t } = useTranslation();
  const { toast } = useContext(ToastContext);
  const loading = useSelector((state) => state.mailboxes.loading);
  const error = useSelector((state) => state.mailboxes.error);
  const mailboxes = useSelector((state) => state.mailboxes.mailboxes);
  const canHaveMultipleMailboxes = useSelector(
    (state) => state.capabilities.receiveCapabilities.multipleMailboxes
  );
  const [actions, setActions] = useState({});
  const [mailboxName, setMailboxName] = useState("");
  const [newMailboxName, setNewMailboxName] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMailboxes);

    const interval = setInterval(() => {
      dispatch(setMailboxes);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    document.title = `${t("mailboxes")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <p className="text-center">{t("loading")}</p>;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t("mailboxes")}
        </h1>
        {canHaveMultipleMailboxes ? (
          <>
            <div className="flex mx-2 mb-1">
              <form
                className="w-full bg-accent text-base rounded-md flex flex-row flex-nowrap"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`/api/receive/mailbox`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        name: mailboxName
                      }),
                      credentials: "include"
                    });
                    const data = await res.json();
                    if (res.status == 200) {
                      toast(t("addmailboxsuccess"));
                      dispatch(setMailboxes);
                    } else {
                      toast(
                        t("addmailboxfail", {
                          error: data.message
                        })
                      );
                    }
                  } catch (err) {
                    toast(
                      t("addmailboxfail", {
                        error: err.message
                      })
                    );
                  }
                  setMailboxName("");
                }}
              >
                <input
                  type="text"
                  required={true}
                  value={mailboxName}
                  onChange={(e) => {
                    setMailboxName(e.target.value);
                  }}
                  placeholder={t("mailboxname")}
                  className="bg-inherit h-full w-full pl-2 pr-0 rtl:pl-0 rtl:pr-2 rounded-md focus:outline-primary focus:outline-2 focus:outline"
                />
                <button
                  type="submit"
                  className="bg-transparent text-inherit shrink-0"
                >
                  <Plus
                    width={32}
                    height={32}
                    className="inline-block h-full p-1 text-accent-foreground"
                  >
                    <title>{t("addmailbox")}</title>
                  </Plus>
                </button>
              </form>
            </div>
            <ul className="mt-4">
              {mailboxes.map((mailbox) => {
                let title = mailbox.name;
                let type = mailbox.type;
                const id = mailbox.id;
                const level = mailbox.level;
                let DisplayedIcon = Folder;
                if (type == "inbox") {
                  title = t("inbox");
                  DisplayedIcon = Inbox;
                } else if (type == "starred") {
                  title = t("starred");
                  DisplayedIcon = Star;
                } else if (type == "important") {
                  title = t("important");
                  DisplayedIcon = CircleAlert;
                } else if (type == "sent") {
                  title = t("sent");
                  DisplayedIcon = SendHorizontal;
                } else if (type == "drafts") {
                  title = t("drafts");
                  DisplayedIcon = File;
                } else if (type == "all") {
                  title = t("all");
                  DisplayedIcon = Mail;
                } else if (type == "spam") {
                  title = t("spam");
                  DisplayedIcon = Ban;
                } else if (type == "trash") {
                  title = t("trash");
                  DisplayedIcon = Trash;
                } else if (type == "archive") {
                  title = t("archive");
                  DisplayedIcon = Archive;
                }
                return (
                  <li key={id}>
                    <div
                      title={title}
                      className={`bg-background text-foreground block my-1 ${level == 0 ? "" : level == 1 ? "ml-4 rtl:ml-0 rtl:mr-4" : "ml-8 rtl:ml-0 rtl:mr-8"} px-2 py-1 pr-1 rtl:pr-2 rtl:pl-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
                    >
                      <div className="flex flex-row w-auto">
                        <DisplayedIcon
                          className="shrink-0 inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                          size={24}
                        />
                        {actions[id] == "remove" ? (
                          <>
                            <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center text-red-500">
                              {t("reallyremovemailbox")}
                            </span>
                            <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActions({});
                                }}
                                title={t("cancel")}
                                className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                              >
                                <X
                                  width={16}
                                  height={16}
                                  className="inline w-6 h-6 align-top"
                                />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    const res = await fetch(
                                      `/api/receive/mailbox/${encodeURI(id)}`,
                                      {
                                        method: "DELETE",
                                        credentials: "include"
                                      }
                                    );
                                    const data = await res.json();
                                    if (res.status == 200) {
                                      toast(t("deletemailboxsuccess"));
                                      dispatch(setMailboxes);
                                    } else {
                                      toast(
                                        t("deletemailboxfail", {
                                          error: data.message
                                        })
                                      );
                                    }
                                  } catch (err) {
                                    toast(
                                      t("deletemailboxfail", {
                                        error: err.message
                                      })
                                    );
                                  }
                                  setActions({});
                                }}
                                title={t("deletemailbox")}
                                className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                              >
                                <Check
                                  width={16}
                                  height={16}
                                  className="inline w-6 h-6 align-top"
                                />
                              </button>
                            </span>
                          </>
                        ) : actions[id] == "rename" ? (
                          <>
                            <input
                              type="text"
                              placeholder={t("mailboxname")}
                              onChange={(e) => {
                                setNewMailboxName(e.target.value);
                              }}
                              value={newMailboxName}
                              required={true}
                              className="bg-inherit w-full pl-2 pr-0 rtl:pl-0 rtl:pr-2 rounded-md focus:outline-primary self-center focus:outline-2 focus:outline"
                            />
                            <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setNewMailboxName("");
                                  setActions({});
                                }}
                                title={t("cancel")}
                                className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                              >
                                <X
                                  width={16}
                                  height={16}
                                  className="inline w-6 h-6 align-top"
                                />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (newMailboxName) {
                                    try {
                                      const res = await fetch(
                                        `/api/receive/mailbox/${encodeURI(id)}`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json"
                                          },
                                          body: JSON.stringify({
                                            name: newMailboxName
                                          }),
                                          credentials: "include"
                                        }
                                      );
                                      const data = await res.json();
                                      if (res.status == 200) {
                                        toast(t("renamemailboxsuccess"));
                                        dispatch(setMailboxes);
                                      } else {
                                        toast(
                                          t("renamemailboxfail", {
                                            error: data.message
                                          })
                                        );
                                      }
                                    } catch (err) {
                                      toast(
                                        t("renamemailboxfail", {
                                          error: err.message
                                        })
                                      );
                                    }
                                    setNewMailboxName("");
                                    setActions({});
                                  }
                                }}
                                title={t("renamemailbox")}
                                className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                              >
                                <Check
                                  width={16}
                                  height={16}
                                  className="inline w-6 h-6 align-top"
                                />
                              </button>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center">
                              {title}
                            </span>
                            {type == "normal" ? (
                              <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newActions = {};
                                    newActions[id] = "rename";
                                    setActions(newActions);
                                  }}
                                  title={t("renamemailbox")}
                                  className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                                >
                                  <Pencil
                                    width={16}
                                    height={16}
                                    className="inline w-6 h-6 align-top"
                                  />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newActions = {};
                                    newActions[id] = "remove";
                                    setActions(newActions);
                                  }}
                                  title={t("deletemailbox")}
                                  className="inline-block align-middle w-6 h-6 mx-1 rounded-sm hover:bg-accent/60 hover:text-accent-foreground transition-colors"
                                >
                                  <X
                                    width={16}
                                    height={16}
                                    className="inline w-6 h-6 align-top"
                                  />
                                </button>
                              </span>
                            ) : (
                              ""
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="my-2">{t("mailboxsettingsdisabled")}</p>
        )}
      </>
    );
  }
}

export default MailboxesSettings;
