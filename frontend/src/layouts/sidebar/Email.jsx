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
  Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";

// TODO: fetch mailboxes from API

const mailboxes = [
  { id: 0, type: "inbox", name: "INBOX", new: 2 },
  { id: 1, type: "starred", name: "Starred", new: 0 },
  { id: 2, type: "important", name: "Important", new: 0 },
  { id: 3, type: "sent", name: "Sent", new: 0 },
  { id: 4, type: "drafts", name: "Drafts", new: 0 },
  { id: 5, type: "all", name: "All messages", new: 0 },
  { id: 6, type: "spam", name: "Spam", new: 0 },
  { id: 7, type: "trash", name: "Trash", new: 0 },
  { id: 8, type: "normal", name: "Folder 1", new: 1 },
  { id: 9, type: "normal", name: "Folder 2", new: 0 }
];

const activeMailboxId = 0;

function EmailSidebar() {
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          alert("Compose pressed");
        }}
        className="w-full bg-primary text-primary-foreground p-2 mt-2 rounded-md hover:bg-primary/75 transition-colors"
      >
        <MailPlus
          className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
          size={24}
        />
        {t("compose")}
      </button>
      <ul className="mt-4">
        {mailboxes.map((mailbox) => {
          let title = mailbox.name;
          let type = mailbox.type;
          const id = mailbox.id;
          const newMessages = mailbox.new;
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
          }
          return (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Selected mailbox: ${id}`);
                }}
                title={title}
                className={`${activeMailboxId == id ? "bg-accent text-accent-foregound" : "bg-background text-foreground"} block w-full my-1 px-2 py-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
              >
                <div className="flex flex-row w-full">
                  <DisplayedIcon
                    className="shrink-0 inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                    size={24}
                  />
                  <span className="grow overflow-hidden text-ellipsis whitespace-nowrap">
                    {title}
                  </span>
                  {newMessages > 0 ? (
                    <span className="shrink-0 ml-1 rtl:ml-0 rtl:mr-1">
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

export default EmailSidebar;
