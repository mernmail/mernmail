import { MailPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

function EmailSidebar() {
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          alert("Compose pressed");
        }}
        className="w-full bg-primary text-primary-foreground p-2 mt-2 rounded-md hover:bg-primary/75 transition-colors"
      >
        <MailPlus className="inline mr-2" size={24} />
        {t("compose")}
      </button>
    </>
  );
}

export default EmailSidebar;
