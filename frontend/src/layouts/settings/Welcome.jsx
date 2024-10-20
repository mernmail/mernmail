import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function WelcomeSettings() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("settings")} - MERNMail`;
  }, [t]);

  return (
    <>
      <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
        {t("settings")}
      </h1>
      <p className="my-2">{t("settingsguide")}</p>
    </>
  );
}

export default WelcomeSettings;
