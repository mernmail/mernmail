import { useSelector } from "react-redux";
import MailboxActionButton from "@/layouts/action/Mailbox.jsx";

function ActionButton() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox") {
    return <MailboxActionButton />;
  }
}

export default ActionButton;
