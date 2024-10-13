import { useSelector } from "react-redux";
import MailboxContent from "@/layouts/content/Mailbox.jsx";
import MessageContent from "@/layouts/content/Message.jsx";

function Content() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox") {
    return <MailboxContent />;
  } else if (view == "message") {
    return <MessageContent />;
  }
}

export default Content;
