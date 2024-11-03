import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

function ContactsActionButton() {
  const { t } = useTranslation();

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        /*if (
          document.location.hash &&
          !document.location.hash.match(/^#compose(?=$|\/)/)
        )
          document.location.hash = encodeURI(`#compose`);*/
        alert("New contact pressed");
      }}
      className="inline-block fixed z-10 md:hidden bottom-5 right-5 rtl:right-auto rtl:left-5 bg-primary text-primary-foreground p-4 mt-2 rounded-full hover:bg-primary/75 transition-colors"
    >
      <UserPlus className="inline align-top" size={24}>
        <title>{t("newcontact")}</title>
      </UserPlus>
    </a>
  );
}

export default ContactsActionButton;
