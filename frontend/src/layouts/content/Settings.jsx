import { useSelector } from "react-redux";
import LanguageSettings from "@/layouts/settings/Language.jsx";
import NotificationsSettings from "@/layouts/settings/Notifications.jsx";
import SignatureSettings from "@/layouts/settings/Signature.jsx";
import ThemeSettings from "@/layouts/settings/Theme.jsx";
import WelcomeSettings from "@/layouts/settings/Welcome.jsx";

function SettingsContent() {
  const currentCategory = useSelector(
    (state) => state.settings.currentCategory
  );
  if (currentCategory == "theme") {
    return <ThemeSettings />;
  } else if (currentCategory == "notifications") {
    return <NotificationsSettings />;
  } else if (currentCategory == "language") {
    return <LanguageSettings />;
  } else if (currentCategory == "signature") {
    return <SignatureSettings />;
  } else {
    return <WelcomeSettings />;
  }
}

export default SettingsContent;
