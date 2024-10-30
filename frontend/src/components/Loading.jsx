import { useTranslation } from "react-i18next";

function Loading() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="border-4 border-primary/50 border-t-primary rounded-full w-8 h-8 animate-spin" />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}

export default Loading;
