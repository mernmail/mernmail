import LogoMonochrome from "@/components/LogoMonochrome.jsx";
import {
  Mail,
  BookUser,
  Search,
  LogOut,
  Settings,
  User,
  Menu,
  X
} from "lucide-react";
import { logout } from "@/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EmailSidebar from "@/layouts/sidebar/Email";

function LoginLayout() {
  const email = useSelector((state) =>
    state.auth.auth ? state.auth.auth.email : "Unknown"
  );
  const dispatch = useDispatch();
  const [menuShown, setMenuShown] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "MERNMail";
  }, [t]);

  return (
    <div className="block w-full h-screen relative">
      <header className="fixed h-12 flex flex-row flex-nowrap justify-between w-full py-2 px-3 text-lg bg-primary text-primary-foreground">
        <div className="whitespace-nowrap">
          <span className="sr-only">MERNMail logo</span>
          <LogoMonochrome
            width={160}
            height={35}
            className="inline mr-2 md:mr-4 rtl:mr-0 rtl:ml-2 rtl:md:ml-4 h-6 md:h-8 w-auto"
          />
          <ul className="inline list-none">
            <li className="inline">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="inline-block align-middle bg-primary-foreground text-primary px-1 py-1 w-9 h-8 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors"
              >
                <Mail className="inline-block w-full align-top">
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
                className="inline-block align-middle text-inherit px-1 py-1 w-9 h-8 mx-0.5 rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors"
              >
                <BookUser className="inline-block w-full align-top">
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
            className="bg-inherit h-full w-full pl-2 pr-0 rtl:pl-0 rtl:pr-2 mb-2 rounded-md focus:outline-accent-foreground focus:outline-2 focus:outline"
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
          <span className="hidden md:inline mr-1 rtl:mr-0 rtl:ml-1 text-base align-middle">
            {email}
          </span>
          <span className="hidden md:inline select-none align-middle">|</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="inline-block text-inherit w-8 h-8 py-1 mx-0.5 align-middle rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors"
          >
            <Settings className="inline-block w-full align-top">
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
            className="inline-block text-inherit w-8 h-8 py-1 mx-0.5 align-middle rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors"
          >
            <LogOut className="inline-block w-full align-top">
              <title>{t("logout")}</title>
            </LogOut>
          </a>
          <span className="inline md:hidden select-none align-middle">|</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuShown(!menuShown);
            }}
            className="inline-block md:hidden text-inherit w-8 h-8 py-1 mx-0.5 align-middle rounded-sm hover:bg-primary-foreground/30 hover:text-primary-foreground transition-colors"
          >
            <Menu className="inline-block w-full align-top">
              <title>{t("menu")}</title>
            </Menu>
          </a>
        </span>
      </header>
      <div className="h-full pt-12 md:flex md:flex-row">
        <aside
          className={`bg-background w-full h-full p-2 overflow-auto fixed top-0 ${menuShown ? "left-0" : "left-full"} transition-[left] duration-1000 md:static md:w-72 md:border-r-2 rtl:md:border-r-0 rtl:md:border-l-2 md:border-border md:transition-none`}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuShown(!menuShown);
            }}
            className="inline-block md:hidden float-right"
          >
            <X className="inline-block w-8 h-8 py-1 rounded-sm bg-background text-foreground hover:bg-accent/60 hover:text-accent-foreground transition-colors">
              <title>{t("close")}</title>
            </X>
          </a>
          {/* TODO: One sidebar only for now */}
          <EmailSidebar />
        </aside>
        <main className="overflow-auto grow p-2">Main content</main>
      </div>
    </div>
  );
}

export default LoginLayout;
