import Icon from "@/components/Icon.jsx";
import { useEffect } from "react";

function LoginLayout() {
  useEffect(() => {
    document.title = "MERNMail";
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <Icon
        width={500}
        height={500}
        className="max-w-32 mx-auto box-border animate-ping"
      />
    </div>
  );
}

export default LoginLayout;
