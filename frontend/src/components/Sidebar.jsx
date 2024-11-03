import { useSelector } from "react-redux";
import AddressBookSidebar from "@/layouts/sidebar/AddressBook.jsx";
import EmailSidebar from "@/layouts/sidebar/Email.jsx";
import SettingsSidebar from "@/layouts/sidebar/Settings.jsx";

function Sidebar() {
  const view = useSelector((state) => state.view.view);
  if (
    view == "mailbox" ||
    view == "message" ||
    view == "search" ||
    view == "compose"
  ) {
    return <EmailSidebar />;
  } else if (view == "settings") {
    return <SettingsSidebar />;
  } else if (view == "contacts" || view == "contact") {
    return <AddressBookSidebar />;
  }
}

export default Sidebar;
