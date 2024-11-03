import { useSelector } from "react-redux";
import MailboxActionButton from "@/layouts/action/Mailbox.jsx";
import ContactsActionButton from "@/layouts/action/Contacts.jsx";

function ActionButton() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox") {
    return <MailboxActionButton />;
  } else if (view == "contacts") {
    return <ContactsActionButton />;
  }
}

export default ActionButton;
