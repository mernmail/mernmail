import { useSelector } from "react-redux";
import ComposeContent from "@/layouts/content/Compose.jsx";
import ContactContent from "@/layouts/content/Contact.jsx";
import ContactsContent from "@/layouts/content/Contacts.jsx";
import MailboxContent from "@/layouts/content/Mailbox.jsx";
import MessageContent from "@/layouts/content/Message.jsx";
import SearchContent from "@/layouts/content/Search.jsx";
import SettingsContent from "@/layouts/content/Settings.jsx";

function Content() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox") {
    return <MailboxContent />;
  } else if (view == "message") {
    return <MessageContent />;
  } else if (view == "search") {
    return <SearchContent />;
  } else if (view == "settings") {
    return <SettingsContent />;
  } else if (view == "compose") {
    return <ComposeContent />;
  } else if (view == "contacts") {
    return <ContactsContent />;
  } else if (view == "contact") {
    return <ContactContent />;
  }
}

export default Content;
