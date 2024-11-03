import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

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
  .use(
    resourcesToBackend(
      (lng, ns) =>
        new Promise((resolve, reject) => {
          import("./i18n-resources.js")
            .then((resources) => {
              if (resources.default[lng][ns])
                resolve({ default: resources.default[lng][ns] });
              else
                reject(
                  new Error("The language/namespace combination doesn't exist.")
                );
            })
            .catch((err) => {
              reject(err);
            });
        })
    )
  )
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;
