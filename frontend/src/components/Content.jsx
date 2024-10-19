import { useSelector } from "react-redux";
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
  }
}

export default Content;
