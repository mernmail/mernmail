import LogoMonochrome from "@/components/LogoMonochrome.jsx";
import {
  Mail,
  BookUser,
  Search,
  LogOut,
  Settings,
  User,
  Menu
} from "lucide-react";
import { logout } from "@/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function LoginLayout() {
  const email = useSelector((state) =>
    state.auth.auth ? state.auth.auth.email : "Unknown"
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "MERNMail";
  });

  return (
    <div className="flex flex-row flex-nowrap justify-between w-full py-2 px-3 text-lg bg-primary text-primary-foreground">
      <div className="whitespace-nowrap">
        <span className="sr-only">MERNMail logo</span>
        <LogoMonochrome
          width={160}
          height={35}
          className="inline mr-2 md:mr-4 h-6 md:h-8 w-auto"
        />
        <ul className="inline list-none">
          <li className="inline">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="inline-block"
            >
              <Mail className="inline-block bg-primary-foreground text-primary w-9 h-8 px-1 py-1 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors">
                <title>{t("email")}</title>
              </Mail>
            </a>
          </li>
          <li className="inline">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="inline-block"
            >
              <BookUser className="inline-block w-9 h-8 px-1 py-1 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors">
                <title>{t("addressbook")}</title>
              </BookUser>
            </a>
          </li>
        </ul>
      </div>
      <form className="grow max-w-80 bg-accent text-base rounded-md hidden md:flex flex-row flex-nowrap">
        <input
          type="text"
          placeholder={t("search")}
          className="bg-inherit h-full w-full pl-2 pr-0 mb-2 rounded-md focus-visible:outline-accent-foreground focus-visible:outline-2 focus-visible:outline"
        />
        <Search
          width={32}
          height={32}
          className="inline-block h-full p-1 text-accent-foreground"
        />
      </form>
      <span className="self-center whitespace-nowrap text-right">
        <User className="hidden md:inline-block w-8 h-8 py-1">
          <title>{t("user")}</title>
        </User>
        <span className="hidden md:inline mr-1 text-base align-middle">
          {email}
        </span>
        <span className="hidden md:inline select-none align-middle">|</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="inline-block"
        >
          <Settings className="inline-block w-8 h-8 py-1 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors">
            <title>{t("settings")}</title>
          </Settings>
        </a>
        <span className="inline select-none align-middle">|</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            dispatch(logout());
          }}
          className="inline-block"
        >
          <LogOut className="inline-block w-8 h-8 py-1 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors">
            <title>{t("logout")}</title>
          </LogOut>
        </a>
        <span className="inline md:hidden select-none align-middle">|</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="inline-block md:hidden"
        >
          <Menu className="inline-block md:hidden w-8 h-8 py-1 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors">
            <title>{t("menu")}</title>
          </Menu>
        </a>
      </span>
    </div>
  );
}

export default LoginLayout;
