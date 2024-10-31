import { MailPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

function EmailActionButton() {
  const { t } = useTranslation();

  return (
    <a
      href="#compose"
      onClick={(e) => {
        e.preventDefault();
        if (
          document.location.hash &&
          !document.location.hash.match(/^#compose(?=$|\/)/)
        )
          document.location.hash = encodeURI(`#compose`);
      }}
      className="inline-block fixed z-10 md:hidden bottom-5 right-5 rtl:right-auto rtl:left-5 bg-primary text-primary-foreground p-4 mt-2 rounded-full hover:bg-primary/75 transition-colors"
    >
      <MailPlus className="inline align-top" size={24}>
        <title>{t("compose")}</title>
      </MailPlus>
    </a>
  );
}

export default EmailActionButton;
