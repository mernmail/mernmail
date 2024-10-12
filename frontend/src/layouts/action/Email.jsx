import { MailPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

function EmailActionButton() {
  const { t } = useTranslation();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        alert("Compose pressed");
      }}
      className="absolute z-10 md:hidden bottom-5 right-5 rtl:right-auto rtl:left-5 bg-primary text-primary-foreground p-4 mt-2 rounded-full hover:bg-primary/75 transition-colors"
    >
      <MailPlus className="inline align-top" size={24}>
        <title>{t("compose")}</title>
      </MailPlus>
    </button>
  );
}

export default EmailActionButton;