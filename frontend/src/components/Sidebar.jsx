import { useSelector } from "react-redux";
import EmailSidebar from "@/layouts/sidebar/Email.jsx";

function Sidebar() {
  const view = useSelector((state) => state.view.view);
  if (view == "mailbox" || view == "message" || view == "search") {
    return <EmailSidebar />;
  }
}

export default Sidebar;
