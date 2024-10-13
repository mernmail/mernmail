import { useSelector } from "react-redux";
import MailboxContent from "@/layouts/content/Mailbox.jsx";
import MessageContent from "@/layouts/content/Message.jsx";
import SearchContent from "@/layouts/content/Search.jsx";

function Content() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox") {
    return <MailboxContent />;
  } else if (view == "message") {
    return <MessageContent />;
  } else if (view == "search") {
    return <SearchContent />;
  }
}

export default Content;
