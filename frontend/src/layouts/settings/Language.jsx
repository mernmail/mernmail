import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

// Lazy load language resources, because of JavaScript bundle size.

function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [languageResources, setLanguageResources] = useState({});

  useEffect(() => {
    const sideEffect = async () => {
      if (loading) {
        setLanguageResources((await import("@/i18n-resources.js")).default);
        setLoading(false);
      }
    };
    sideEffect();
  }, [loading]);

  useEffect(() => {
    document.title = `${t("language")} - MERNMail`;
  }, [t]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <>
        <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
          {t("language")}
        </h1>
        <div className="mx-2 mb-2">
          <select
            onChange={(e) => {
              e.preventDefault();
              i18n.changeLanguage(e.target.value);
            }}
            defaultValue={i18n.language}
            className="bg-accent text-accent-foreground p-2 w-full rounded-md box-border focus:outline-primary focus:outline-2 focus:outline"
          >
            {Object.keys(languageResources)
              .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
              .map((lang) => {
                return (
                  <option key={lang} value={lang}>
                    {languageResources[lang].name}
                  </option>
                );
              })}
          </select>
        </div>
      </>
    );
  }
}

export default LanguageSettings;
