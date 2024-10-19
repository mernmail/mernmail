import { useSelector } from "react-redux";
import ExampleSettings from "@/layouts/settings/Example.jsx";
import WelcomeSettings from "@/layouts/settings/Welcome.jsx";

function SettingsContent() {
  const currentCategory = useSelector(
    (state) => state.settings.currentCategory
  );
  if (currentCategory == "example") {
    return <ExampleSettings />;
  } else {
    return <WelcomeSettings />;
  }
}

export default SettingsContent;
