import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from "@/i18n-resources.js";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.on("initialized", () => {
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.dir(i18n.language);
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
});

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

export default i18n;
