import {
  MailPlus,
  Folder,
  Inbox,
  Star,
  SendHorizontal,
  File,
  Ban,
  Trash,
  CircleAlert,
  Mail,
  Archive
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  setMailboxes,
  initCurrentMailbox,
  setCurrentMailboxFromURL
} from "@/slices/mailboxesSlice.js";
import { hideMenu } from "@/slices/menuSlice.js";
import Loading from "@/components/Loading.jsx";

function EmailSidebar() {
  const { t } = useTranslation();
  const view = useSelector((state) => state.view.view);
  const loading = useSelector((state) => state.mailboxes.loading);
  const error = useSelector((state) => state.mailboxes.error);
  const mailboxes = useSelector((state) => state.mailboxes.mailboxes);
  const currentMailbox = useSelector((state) => state.mailboxes.currentMailbox);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMailboxes);

    const interval = setInterval(() => {
      dispatch(setMailboxes);
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (view == "mailbox" || view == "message") {
      const onBackButtonEvent = () => {
        setTimeout(() => {
          dispatch(setCurrentMailboxFromURL());
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  useEffect(() => {
    if (view == "mailbox" || view == "message") {
      if (view == "mailbox") dispatch(initCurrentMailbox());
      dispatch(setCurrentMailboxFromURL());
    }
  }, [view, loading, dispatch]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
    );
  } else {
    return (
      <>
        <a
          href="#compose"
          onClick={(e) => {
            e.preventDefault();
            dispatch(hideMenu());
            if (
              document.location.hash &&
              !document.location.hash.match(/^#compose(?=$|\/)/)
            )
              document.location.hash = encodeURI(`#compose`);
          }}
          className="inline-block text-center w-full bg-primary text-primary-foreground p-2 mt-2 rounded-md hover:bg-primary/75 transition-colors"
        >
          <MailPlus
            className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
            size={24}
          />
          <span className="align-middle">{t("compose")}</span>
        </a>
        <ul className="mt-4">
          {mailboxes.map((mailbox) => {
            let title = mailbox.name;
            let type = mailbox.type;
            const id = mailbox.id;
            const level = mailbox.level;
            const newMessages = mailbox.new;
            const openable = mailbox.openable;
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
                <a
                  href={encodeURI(`#mailbox/${id}`)}
                  onClick={(e) => {
                    e.preventDefault();
                    let loseComposerChanges = true;
                    if (
                      document.location.hash &&
                      document.location.hash.match(/^#compose(?=$|\/)/)
                    ) {
                      loseComposerChanges = confirm(t("exitcomposer"));
                    }
                    if (openable && loseComposerChanges) {
                      dispatch(hideMenu());
                      document.location.hash = encodeURI(`#mailbox/${id}`);
                    }
                  }}
                  title={title}
                  className={`${(view == "mailbox" || view == "message") && currentMailbox == id ? "bg-accent text-accent-foregound" : "bg-background text-foreground"} block my-1 ${level == 0 ? "" : level == 1 ? "ml-4 rtl:ml-0 rtl:mr-4" : "ml-8 rtl:ml-0 rtl:mr-8"} px-2 py-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
                >
                  <div className="flex flex-row w-auto">
                    <DisplayedIcon
                      className="shrink-0 inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                      size={24}
                    />
                    <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center">
                      {title}
                    </span>
                    {newMessages > 0 ? (
                      <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1 self-center">
                        {newMessages}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </>
    );
  }
}

export default EmailSidebar;
