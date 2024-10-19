import { useSelector } from "react-redux";
import ExampleSettings from "@/layouts/settings/Example.jsx";
import Example2Settings from "@/layouts/settings/Example2.jsx";
import WelcomeSettings from "@/layouts/settings/Welcome.jsx";

function SettingsContent() {
  const currentCategory = useSelector(
    (state) => state.settings.currentCategory
  );
  if (currentCategory == "example") {
    return <ExampleSettings />;
  } else if (currentCategory == "example2") {
    return <Example2Settings />;
  } else {
    return <WelcomeSettings />;
  }
}

export default SettingsContent;
