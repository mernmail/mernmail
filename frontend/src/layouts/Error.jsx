import Logo from "@/components/Logo.jsx";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function ErrorLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("error") + " - MERNMail";
  }, [t]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="block w-full max-w-lg p-4">
        <span className="sr-only">MERNMail logo</span>
        <Logo
          width={500}
          height={100}
          className="max-w-md w-full mx-auto box-border mb-8"
        />
        <p className="text-red-500 block text-center">{t("unexpectederror")}</p>
        <button
          className="w-full bg-primary text-primary-foreground p-2 mt-6 rounded-md hover:bg-primary/75 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            document.location.reload();
          }}
        >
          <RefreshCw
            className="inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
            size={24}
          />
          {t("reload")}
        </button>
      </div>
    </div>
  );
}

export default ErrorLayout;
