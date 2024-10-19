import { useSelector } from "react-redux";
import ExampleSettings from "@/layouts/settings/Example.jsx";
import ThemeSettings from "@/layouts/settings/Theme.jsx";
import WelcomeSettings from "@/layouts/settings/Welcome.jsx";

function SettingsContent() {
  const currentCategory = useSelector(
    (state) => state.settings.currentCategory
  );
  if (currentCategory == "example") {
    return <ExampleSettings />;
  } else if (currentCategory == "theme") {
    return <ThemeSettings />;
  } else {
    return <WelcomeSettings />;
  }
}

export default SettingsContent;
