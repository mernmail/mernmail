import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUSLang from "@/locales/en-US/translation.json";
import plLang from "@/locales/pl/translation.json";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  "en-US": {
    translation: enUSLang,
    name: "English (United States)"
  },
  pl: {
    translation: plLang,
    name: "Polski"
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en-US",
    resources: resources,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
});

export { resources };

export default i18n;
