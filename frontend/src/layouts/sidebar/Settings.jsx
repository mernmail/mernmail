import { Bell, CircleHelp, Languages, Palette, Signature } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hideMenu } from "@/slices/menuSlice.js";
import { setCurrentCategoryFromURL } from "@/slices/settingsSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

function SettingsSidebar() {
  const { t } = useTranslation();
  const view = useSelector((state) => state.view.view);
  const currentCategory = useSelector(
    (state) => state.settings.currentCategory
  );
  const dispatch = useDispatch();

  const categories = [
    {
      id: "example",
      name: "Example",
      icon: CircleHelp
    },
    {
      id: "language",
      name: t("language"),
      icon: Languages
    },
    {
      id: "notifications",
      name: t("notifications"),
      icon: Bell
    },
    {
      id: "theme",
      name: t("theme"),
      icon: Palette
    },
    {
      id: "signature",
      name: t("signature"),
      icon: Signature
    }
  ];

  useEffect(() => {
    if (view == "settings") {
      const onBackButtonEvent = () => {
        setTimeout(() => {
          dispatch(setCurrentCategoryFromURL());
        }, 0);
      };

      window.addEventListener("popstate", onBackButtonEvent);
      return () => {
        window.removeEventListener("popstate", onBackButtonEvent);
      };
    }
  }, [view, dispatch]);

  useEffect(() => {
    if (view == "settings") {
      dispatch(setCurrentCategoryFromURL());
    }
  }, [view, dispatch]);

  return (
    <ul className="mt-10 md:mt-2">
      {categories.map((category) => {
        const name = category.name;
        const id = category.id;
        const DisplayedIcon = category.icon;
        return (
          <li key={id}>
            <a
              href={encodeURI(`#settings/${id}`)}
              onClick={(e) => {
                e.preventDefault();
                dispatch(hideMenu());
                document.location.hash = encodeURI(`#settings/${id}`);
              }}
              title={name}
              className={`${view == "settings" && currentCategory == id ? "bg-accent text-accent-foregound" : "bg-background text-foreground"} block my-1 px-2 py-1 rounded-md hover:bg-accent/60 hover:text-accent-foreground transition-colors`}
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
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default SettingsSidebar;
