import { useSelector } from "react-redux";
import EmailSidebar from "@/layouts/sidebar/Email.jsx";
import SettingsSidebar from "@/layouts/sidebar/Settings.jsx";

function Sidebar() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox" || view == "message" || view == "search") {
    return <EmailSidebar />;
  } else if (view == "settings") {
    return <SettingsSidebar />;
  }
}

export default Sidebar;
