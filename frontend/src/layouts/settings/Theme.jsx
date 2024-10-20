import { useTranslation } from "react-i18next";
import { ThemeContext } from "@/contexts/ThemeContext.jsx";
import { useContext, useEffect } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";

function ThemeSettings() {
  const { t } = useTranslation();
  const { currentTheme, setTheme, areThemesSupported } =
    useContext(ThemeContext);

  useEffect(() => {
    document.title = `${t("theme")} - MERNMail`;
  }, [t]);

  const themes = [
    { id: "system", name: t("system"), icon: SunMoon },
    { id: "light", name: t("light"), icon: Sun },
    { id: "dark", name: t("dark"), icon: Moon }
  ];

  return (
    <>
      <h1 className="text-3xl md:text-4xl mt-2 mb-2.5 pb-0.5 md:mb-2 md:pb-1 font-bold content-center overflow-hidden text-ellipsis">
        {t("theme")}
      </h1>
      {areThemesSupported ? (
        <ul className="list-none">
          {themes.map((theme) => {
            const name = theme.name;
            const id = theme.id;
            const DisplayedIcon = theme.icon;
            return (
              <li key={id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(id);
                  }}
                  title={name}
                  className={`${currentTheme == id ? "bg-accent text-accent-foregound" : "bg-background text-foreground"} block my-1 px-2 py-1 w-full rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors text-left rtl:text-right`}
                >
                  <div className="flex flex-row w-auto">
                    <DisplayedIcon
                      className="shrink-0 inline mr-2 rtl:mr-0 rtl:ml-2 align-top"
                      size={24}
                    />
                    <span className="grow overflow-hidden text-ellipsis whitespace-nowrap self-center">
                      {name}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="my-2">{t("themesnotsupported")}</p>
      )}
    </>
  );
}

export default ThemeSettings;
